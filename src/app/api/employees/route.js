import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit')) || 100;
    
    let sql = `
      SELECT * FROM employees 
      WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR department LIKE ? OR role LIKE ?)
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    const searchTerm = `%${search}%`;
    const employees = await query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]);
    
    return Response.json(employees);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch employees' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const employeeData = await request.json();
    
    // Validate required fields
    if (!employeeData.firstName || !employeeData.lastName || !employeeData.username) {
      return Response.json(
        { error: 'First name, last name, and username are required' }, 
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingEmployee = await query(
      'SELECT id FROM employees WHERE username = ?',
      [employeeData.username]
    );
    
    if (existingEmployee.length > 0) {
      return Response.json(
        { error: 'Username already exists' }, 
        { status: 400 }
      );
    }
    
    // Hash password if provided
    let hashedPassword = null;
    if (employeeData.emailPassword) {
      hashedPassword = await bcrypt.hash(employeeData.emailPassword, 12);
    }
    
    const sql = `
      INSERT INTO employees (
        username, emailPassword, firstName, lastName, gender, empType, department, 
        pfNo, dob, maritalStatus, presentAddress, city, pin, state, country, 
        phone, mobile, email, qualification, institute, passingYear, 
        workExperience, leaveStructure, employeeStatus, role, joiningDate, 
        basicSalary, da, hra, conveyanceAllowance, otherAllowance,
        bonus, pf, mlwf, pt, esic, tds,
        bonusAmount, pfAmount, mlwfPercentage, ptAmount, esicPercentage, tdsPercentage,
        salaryPeriods, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      employeeData.username,
      hashedPassword,
      employeeData.firstName,
      employeeData.lastName,
      employeeData.gender || 'Male',
      employeeData.empType || 'Permanent',
      employeeData.department || '',
      employeeData.pfNo || '',
      employeeData.dob || null,
      employeeData.maritalStatus || 'Single',
      employeeData.presentAddress || '',
      employeeData.city || '',
      employeeData.pin || '',
      employeeData.state || '',
      employeeData.country || 'India',
      employeeData.phone || '',
      employeeData.mobile || '',
      employeeData.email || '',
      employeeData.qualification || '',
      employeeData.institute || '',
      employeeData.passingYear || null,
      employeeData.workExperience || '',
      employeeData.leaveStructure || '',
      employeeData.employeeStatus || 'Working',
      employeeData.role || '',
      employeeData.joiningDate || null,
      employeeData.basicSalary || 0,
      employeeData.da || 0,
      employeeData.hra || 0,
      employeeData.conveyanceAllowance || 0,
      employeeData.otherAllowance || 0,
      employeeData.bonus ? 1 : 0,
      employeeData.pf ? 1 : 0,
      employeeData.mlwf ? 1 : 0,
      employeeData.pt ? 1 : 0,
      employeeData.esic ? 1 : 0,
      employeeData.tds ? 1 : 0,
      employeeData.bonusAmount || 0,
      employeeData.pfAmount || 0,
      employeeData.mlwfPercentage || 7,
      employeeData.ptAmount || 0,
      employeeData.esicPercentage || 7,
      employeeData.tdsPercentage || 0,
      JSON.stringify(employeeData.salaryPeriods || [])
    ];
    
    const result = await query(sql, values);
    
    return Response.json(
      { 
        message: 'Employee created successfully', 
        employeeId: result.insertId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to create employee' }, 
      { status: 500 }
    );
  }
}
