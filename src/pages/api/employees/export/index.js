import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { department, status, search } = req.query;

  try {
    let query = `
      SELECT 
        e.employee_id, e.first_name, e.last_name, e.email, 
        e.phone, e.department, e.designation, 
        DATE_FORMAT(e.join_date, '%Y-%m-%d') as join_date,
        e.employment_status,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name,
        e.city, e.state, e.country
      FROM 
        employees e
      LEFT JOIN 
        employees m ON e.reporting_manager_id = m.id
      WHERE 1=1
    `;
    
    const params = [];

    // Add filters
    if (department) {
      query += ' AND e.department = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND e.employment_status = ?';
      params.push(status);
    }

    if (search) {
      query += ` AND (
        e.employee_id LIKE ? OR 
        e.first_name LIKE ? OR 
        e.last_name LIKE ? OR 
        CONCAT(e.first_name, ' ', e.last_name) LIKE ? OR
        e.email LIKE ? OR
        e.department LIKE ? OR
        e.designation LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add sorting
    query += ' ORDER BY e.id ASC';

    const employees = await executeQuery(query, params);

    // Generate CSV
    if (employees.length === 0) {
      return res.status(404).json({ message: 'No employees found matching criteria' });
    }

    const headers = Object.keys(employees[0]).join(',');
    const rows = employees.map(emp => {
      return Object.values(emp)
        .map(val => {
          if (val === null || val === undefined) return '';
          // Escape double quotes and wrap values in quotes
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csv = [headers, ...rows].join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="employees_export_${new Date().toISOString().slice(0, 10)}.csv"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error('Employee CSV export error:', error);
    return res.status(500).json({ message: 'Failed to export employees', error: error.message });
  }
}
