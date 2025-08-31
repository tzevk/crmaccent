import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  let connection;
  try {
    const db = getDb();
    connection = await db.getConnection();

    // Fetch templates with their sections
    const [templates] = await connection.query(`
      SELECT 
        pt.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pts.id,
            'title', pts.title,
            'content', pts.content,
            'order', pts.section_order,
            'is_required', pts.is_required
          )
        ) as sections
      FROM proposal_templates pt
      LEFT JOIN proposal_template_sections pts ON pt.id = pts.template_id
      WHERE pt.is_active = 1
      GROUP BY pt.id
      ORDER BY pt.name
    `);

    // If no templates exist, create default ones
    if (templates.length === 0) {
      await createDefaultTemplates(connection);
      
      // Fetch again after creating defaults
      const [newTemplates] = await connection.query(`
        SELECT 
          pt.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pts.id,
              'title', pts.title,
              'content', pts.content,
              'order', pts.section_order,
              'is_required', pts.is_required
            )
          ) as sections
        FROM proposal_templates pt
        LEFT JOIN proposal_template_sections pts ON pt.id = pts.template_id
        WHERE pt.is_active = 1
        GROUP BY pt.id
        ORDER BY pt.name
      `);
      
      // Parse sections JSON
      const parsedTemplates = newTemplates.map(template => ({
        ...template,
        sections: typeof template.sections === 'string' ? JSON.parse(template.sections || '[]') : template.sections || []
      }));
      
      return NextResponse.json(parsedTemplates);
    }

    // Parse sections JSON for existing templates
    const parsedTemplates = templates.map(template => ({
      ...template,
      sections: typeof template.sections === 'string' ? JSON.parse(template.sections || '[]') : template.sections || []
    }));

    return NextResponse.json(parsedTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function createDefaultTemplates(connection) {
  const defaultTemplates = [
    {
      name: 'Marketing Campaign Proposal',
      category: 'Marketing',
      description: 'Template for digital marketing campaigns, brand strategies, and promotional activities.',
      default_currency: 'INR',
      sections: [
        { title: 'Campaign Overview', content: 'Goals, target audience, and campaign objectives.', order: 1, is_required: true },
        { title: 'Strategy & Approach', content: 'Marketing strategy and tactical approach.', order: 2, is_required: true },
        { title: 'Channel Mix', content: 'Digital channels and media mix recommendations.', order: 3, is_required: true },
        { title: 'Creative Concepts', content: 'Creative direction and content strategy.', order: 4, is_required: false },
        { title: 'Timeline & Deliverables', content: 'Campaign timeline and key deliverables.', order: 5, is_required: true },
        { title: 'Investment & ROI', content: 'Budget breakdown and expected ROI.', order: 6, is_required: true }
      ]
    },
    {
      name: 'Consulting Services Proposal',
      category: 'Consulting',
      description: 'Professional template for consulting services, business analysis, and strategic advisory.',
      default_currency: 'INR',
      sections: [
        { title: 'Executive Summary', content: 'Brief overview of consulting engagement and outcomes.', order: 1, is_required: true },
        { title: 'Current Situation Analysis', content: 'Assessment of current state and challenges.', order: 2, is_required: true },
        { title: 'Proposed Solution', content: 'Recommended approach and methodology.', order: 3, is_required: true },
        { title: 'Implementation Plan', content: 'Detailed implementation roadmap.', order: 4, is_required: true },
        { title: 'Team & Expertise', content: 'Consultant profiles and relevant experience.', order: 5, is_required: false },
        { title: 'Investment & Terms', content: 'Engagement fees and terms of service.', order: 6, is_required: true }
      ]
    }
  ];

  for (const template of defaultTemplates) {
    const { sections, ...templateData } = template;
    
    // Insert template
    const [result] = await connection.execute(`
      INSERT INTO proposal_templates (name, category, description, default_currency, is_active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, 'System', NOW(), NOW())
    `, [templateData.name, templateData.category, templateData.description, templateData.default_currency]);
    
    const templateId = result.insertId;
    
    // Insert sections
    for (const section of sections) {
      await connection.execute(`
        INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [templateId, section.title, section.content, section.order, section.is_required]);
    }
  }
}

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Template name and category are required' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    connection = await db.getConnection();
    
    // Insert template
    const [result] = await connection.execute(`
      INSERT INTO proposal_templates (name, category, description, default_currency, is_active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      body.name,
      body.category,
      body.description || '',
      body.default_currency || 'INR',
      body.is_active !== undefined ? body.is_active : 1,
      body.created_by || 'User'
    ]);
    
    const templateId = result.insertId;
    
    // Insert sections if provided
    if (body.sections && Array.isArray(body.sections)) {
      for (const section of body.sections) {
        await connection.execute(`
          INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [templateId, section.title, section.content, section.order || 1, section.is_required || 1]);
      }
    }
    
    // Fetch the created template with sections
    const [newTemplate] = await connection.query(`
      SELECT 
        pt.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pts.id,
            'title', pts.title,
            'content', pts.content,
            'order', pts.section_order,
            'is_required', pts.is_required
          )
        ) as sections
      FROM proposal_templates pt
      LEFT JOIN proposal_template_sections pts ON pt.id = pts.template_id
      WHERE pt.id = ?
      GROUP BY pt.id
    `, [templateId]);
    
    return NextResponse.json({
      success: true,
      template: newTemplate[0],
      message: 'Template created successfully'
    });
    
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
