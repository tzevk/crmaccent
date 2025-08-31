import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST() {
  let connection;
  try {
    const db = getDb();
    connection = await db.getConnection();

    // Create proposal_templates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proposal_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        default_currency VARCHAR(10) DEFAULT 'INR',
        is_active BOOLEAN DEFAULT 1,
        created_by VARCHAR(255) DEFAULT 'System',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create proposal_template_sections table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proposal_template_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        section_order INT NOT NULL DEFAULT 1,
        is_required BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES proposal_templates(id) ON DELETE CASCADE,
        INDEX idx_template_id (template_id),
        INDEX idx_section_order (section_order)
      )
    `);

    // Check if default templates exist
    const [existingTemplates] = await connection.query('SELECT COUNT(*) as count FROM proposal_templates');
    
    if (existingTemplates[0].count === 0) {
      // Insert default templates
      const defaultTemplates = [
        {
          name: 'Software Development Proposal',
          category: 'Software Development',
          description: 'Comprehensive template for software development projects including web apps, mobile apps, and custom solutions.',
          sections: [
            { title: 'Executive Summary', content: 'Overview of the software solution and its business benefits.', order: 1, is_required: true },
            { title: 'Technical Requirements', content: 'Detailed technical specifications and requirements.', order: 2, is_required: true },
            { title: 'Development Approach', content: 'Methodology, technologies, and development process.', order: 3, is_required: true },
            { title: 'Timeline & Milestones', content: 'Project timeline with key deliverables and milestones.', order: 4, is_required: true },
            { title: 'Investment & Payment Terms', content: 'Cost breakdown and payment schedule.', order: 5, is_required: true },
            { title: 'Support & Maintenance', content: 'Post-delivery support and maintenance terms.', order: 6, is_required: false }
          ]
        },
        {
          name: 'Marketing Campaign Proposal',
          category: 'Marketing',
          description: 'Template for digital marketing campaigns, brand strategies, and promotional activities.',
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
          VALUES (?, ?, ?, 'INR', 1, 'System', NOW(), NOW())
        `, [templateData.name, templateData.category, templateData.description]);
        
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

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tables_created: ['proposal_templates', 'proposal_template_sections']
    });

  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup database' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
