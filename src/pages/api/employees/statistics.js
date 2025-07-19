import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get total employees count
    const totalEmployeesResult = await executeQuery('SELECT COUNT(*) as total FROM employees');
    const totalEmployees = totalEmployeesResult[0].total;

    // Get active employees count
    const activeEmployeesResult = await executeQuery("SELECT COUNT(*) as active FROM employees WHERE status = 'active'");
    const activeEmployees = activeEmployeesResult[0].active;

    // Get inactive employees count
    const inactiveEmployeesResult = await executeQuery("SELECT COUNT(*) as inactive FROM employees WHERE status != 'active'");
    const inactiveEmployees = inactiveEmployeesResult[0].inactive;

    // Get employees by department
    const departmentStatsResult = await executeQuery(`
      SELECT 
        COALESCE(department, 'Unassigned') as department,
        COUNT(*) as count
      FROM employees 
      WHERE status = 'active'
      GROUP BY department 
      ORDER BY count DESC
    `);

    // Get employees by designation
    const designationStatsResult = await executeQuery(`
      SELECT 
        COALESCE(designation, 'Unassigned') as designation,
        COUNT(*) as count
      FROM employees 
      WHERE status = 'active'
      GROUP BY designation 
      ORDER BY count DESC
    `);

    // Get recent hires (last 30 days)
    const recentHiresResult = await executeQuery(`
      SELECT COUNT(*) as recent_hires 
      FROM employees 
      WHERE hire_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Get employees hired this year
    const thisYearHiresResult = await executeQuery(`
      SELECT COUNT(*) as year_hires 
      FROM employees 
      WHERE YEAR(hire_date) = YEAR(NOW())
    `);

    // Get upcoming birthdays (next 30 days)
    const upcomingBirthdaysResult = await executeQuery(`
      SELECT 
        first_name,
        last_name,
        date_of_birth,
        department,
        designation
      FROM employees 
      WHERE status = 'active' 
      AND DATE_FORMAT(date_of_birth, '%m-%d') 
      BETWEEN DATE_FORMAT(NOW(), '%m-%d') 
      AND DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%m-%d')
      ORDER BY DATE_FORMAT(date_of_birth, '%m-%d')
      LIMIT 10
    `);

    // Get gender distribution
    const genderStatsResult = await executeQuery(`
      SELECT 
        COALESCE(gender, 'Not specified') as gender,
        COUNT(*) as count
      FROM employees 
      WHERE status = 'active'
      GROUP BY gender
    `);

    return res.status(200).json({
      success: true,
      statistics: {
        overview: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          recentHires: recentHiresResult[0].recent_hires,
          thisYearHires: thisYearHiresResult[0].year_hires
        },
        departmentDistribution: departmentStatsResult,
        designationDistribution: designationStatsResult,
        genderDistribution: genderStatsResult,
        upcomingBirthdays: upcomingBirthdaysResult
      }
    });

  } catch (error) {
    console.error('Employee Statistics API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
