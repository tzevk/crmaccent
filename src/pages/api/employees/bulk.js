import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleBulkOperations(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Employee Bulk Operations API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

async function handleBulkOperations(req, res) {
  const { operation, employeeIds, data } = req.body;

  if (!operation || !employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Operation type and employee IDs are required'
    });
  }

  // Validate employee IDs
  const validIds = employeeIds.filter(id => !isNaN(id) && id > 0);
  if (validIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid employee IDs provided'
    });
  }

  let result;

  switch (operation) {
    case 'activate':
      result = await bulkUpdateStatus(validIds, 'active');
      break;
    case 'deactivate':
      result = await bulkUpdateStatus(validIds, 'inactive');
      break;
    case 'delete':
      result = await bulkDelete(validIds);
      break;
    case 'update_department':
      if (!data || !data.department) {
        return res.status(400).json({
          success: false,
          message: 'Department is required for bulk department update'
        });
      }
      result = await bulkUpdateDepartment(validIds, data.department);
      break;
    case 'update_designation':
      if (!data || !data.designation) {
        return res.status(400).json({
          success: false,
          message: 'Designation is required for bulk designation update'
        });
      }
      result = await bulkUpdateDesignation(validIds, data.designation);
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Supported operations: activate, deactivate, delete, update_department, update_designation'
      });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows,
    operation
  });
}

async function bulkUpdateStatus(employeeIds, status) {
  const placeholders = employeeIds.map(() => '?').join(',');
  const query = `UPDATE employees SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`;
  const params = [status, ...employeeIds];
  
  const result = await executeQuery(query, params);
  
  return {
    message: `Successfully ${status === 'active' ? 'activated' : 'deactivated'} ${result.affectedRows} employee(s)`,
    affectedRows: result.affectedRows
  };
}

async function bulkDelete(employeeIds) {
  // Check for references in projects first
  const placeholders = employeeIds.map(() => '?').join(',');
  const referencesCheck = await executeQuery(
    `SELECT COUNT(*) as count FROM project_team WHERE user_id IN (${placeholders})`,
    employeeIds
  );
  
  if (referencesCheck[0].count > 0) {
    throw new Error('Some employees are referenced in projects and cannot be deleted');
  }

  // Soft delete by setting status to inactive
  const query = `UPDATE employees SET status = 'inactive', updated_at = NOW() WHERE id IN (${placeholders})`;
  const result = await executeQuery(query, employeeIds);
  
  return {
    message: `Successfully deactivated ${result.affectedRows} employee(s)`,
    affectedRows: result.affectedRows
  };
}

async function bulkUpdateDepartment(employeeIds, department) {
  const placeholders = employeeIds.map(() => '?').join(',');
  const query = `UPDATE employees SET department = ?, updated_at = NOW() WHERE id IN (${placeholders})`;
  const params = [department, ...employeeIds];
  
  const result = await executeQuery(query, params);
  
  return {
    message: `Successfully updated department for ${result.affectedRows} employee(s)`,
    affectedRows: result.affectedRows
  };
}

async function bulkUpdateDesignation(employeeIds, designation) {
  const placeholders = employeeIds.map(() => '?').join(',');
  const query = `UPDATE employees SET designation = ?, updated_at = NOW() WHERE id IN (${placeholders})`;
  const params = [designation, ...employeeIds];
  
  const result = await executeQuery(query, params);
  
  return {
    message: `Successfully updated designation for ${result.affectedRows} employee(s)`,
    affectedRows: result.affectedRows
  };
}
