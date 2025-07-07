import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  // Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'Valid discipline ID is required'
    });
  }

  try {
    switch (method) {
      case 'GET':
        // Get single discipline by ID
        const discipline = await executeQuery(
          'SELECT * FROM disciplines WHERE id = ?',
          [id]
        );

        if (discipline.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Discipline not found'
          });
        }

        return res.status(200).json({
          success: true,
          discipline: discipline[0]
        });

      case 'PUT':
        // Update discipline
        const { 
          discipline_name, 
          start_date, 
          end_date, 
          description,
          is_active 
        } = req.body;

        // Check if discipline exists
        const existingDiscipline = await executeQuery(
          'SELECT id FROM disciplines WHERE id = ?',
          [id]
        );

        if (existingDiscipline.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Discipline not found'
          });
        }

        // Check if name already exists (excluding current discipline)
        if (discipline_name) {
          const nameCheck = await executeQuery(
            'SELECT id FROM disciplines WHERE discipline_name = ? AND id != ?',
            [discipline_name, id]
          );

          if (nameCheck.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'Discipline with this name already exists'
            });
          }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateParams = [];

        if (discipline_name !== undefined) {
          updateFields.push('discipline_name = ?');
          updateParams.push(discipline_name);
        }
        if (start_date !== undefined) {
          updateFields.push('start_date = ?');
          updateParams.push(start_date || null);
        }
        if (end_date !== undefined) {
          updateFields.push('end_date = ?');
          updateParams.push(end_date || null);
        }
        if (description !== undefined) {
          updateFields.push('description = ?');
          updateParams.push(description || null);
        }
        if (is_active !== undefined) {
          updateFields.push('is_active = ?');
          updateParams.push(is_active);
        }

        if (updateFields.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No fields to update'
          });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateParams.push(id);

        const updateQuery = `
          UPDATE disciplines 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;

        await executeQuery(updateQuery, updateParams);

        // Return updated discipline
        const updatedDiscipline = await executeQuery(
          'SELECT * FROM disciplines WHERE id = ?',
          [id]
        );

        return res.status(200).json({
          success: true,
          message: 'Discipline updated successfully',
          discipline: updatedDiscipline[0]
        });

      case 'DELETE':
        // Delete discipline
        // First check if discipline exists
        const disciplineToDelete = await executeQuery(
          'SELECT id FROM disciplines WHERE id = ?',
          [id]
        );

        if (disciplineToDelete.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Discipline not found'
          });
        }

        // Check if discipline is referenced in other tables
        const inquiryReferences = await executeQuery(
          'SELECT COUNT(*) as count FROM inquiries WHERE discipline_id = ?',
          [id]
        );

        const projectReferences = await executeQuery(
          'SELECT COUNT(*) as count FROM projects WHERE discipline_id = ?',
          [id]
        );

        if (inquiryReferences[0].count > 0 || projectReferences[0].count > 0) {
          // Instead of deleting, mark as inactive
          await executeQuery(
            'UPDATE disciplines SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
          );

          return res.status(200).json({
            success: true,
            message: 'Discipline marked as inactive due to existing references'
          });
        }

        // Safe to delete
        await executeQuery('DELETE FROM disciplines WHERE id = ?', [id]);

        return res.status(200).json({
          success: true,
          message: 'Discipline deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Discipline API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
