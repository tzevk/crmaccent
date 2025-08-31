import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(request, { params }) {
  let connection;
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    connection = await db.getConnection();

    // Check if template exists
    const [existingTemplate] = await connection.query(
      'SELECT id, name FROM proposal_templates WHERE id = ?',
      [id]
    );

    if (existingTemplate.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete the template (sections will be deleted by CASCADE)
    const [result] = await connection.execute(
      'DELETE FROM proposal_templates WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
      deletedTemplate: existingTemplate[0]
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    connection = await db.getConnection();

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
      WHERE pt.id = ?
      GROUP BY pt.id
    `, [id]);

    if (templates.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(templates[0]);

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    connection = await db.getConnection();

    // Check if template exists
    const [existingTemplate] = await connection.query(
      'SELECT id FROM proposal_templates WHERE id = ?',
      [id]
    );

    if (existingTemplate.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await connection.beginTransaction();

    // Update template
    await connection.execute(`
      UPDATE proposal_templates 
      SET name = ?, category = ?, description = ?, default_currency = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      body.name,
      body.category,
      body.description || '',
      body.default_currency || 'INR',
      body.is_active !== undefined ? body.is_active : 1,
      id
    ]);

    // Update sections if provided
    if (body.sections && Array.isArray(body.sections)) {
      // Delete existing sections
      await connection.execute(
        'DELETE FROM proposal_template_sections WHERE template_id = ?',
        [id]
      );
      
      // Insert new sections
      for (const section of body.sections) {
        await connection.execute(`
          INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [id, section.title, section.content, section.order || 1, section.is_required || 1]);
      }
    }

    await connection.commit();

    // Fetch updated template with sections
    const [updatedTemplate] = await connection.query(`
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
    `, [id]);

    return NextResponse.json({
      success: true,
      template: updatedTemplate[0],
      message: 'Template updated successfully'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
