import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const employees = await query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    if (employees.length === 0) {
      return Response.json(
        { error: 'Employee not found' }, 
        { status: 404 }
      );
    }
    
    const employee = employees[0];
    // Parse salary periods if they exist
    if (employee.salaryPeriods) {
      try {
        employee.salaryPeriods = JSON.parse(employee.salaryPeriods);
      } catch (e) {
        employee.salaryPeriods = [];
      }
    } else {
      employee.salaryPeriods = [];
    }
    
    return Response.json(employee);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch employee' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const employeeData = await request.json();
    
    // Check if employee exists
    const existingEmployee = await query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );
    
    if (existingEmployee.length === 0) {
      return Response.json(
        { error: 'Employee not found' }, 
        { status: 404 }
      );
    }
    
    // Check if username is being changed and if it already exists
    if (employeeData.username) {
      const duplicateUsername = await query(
        'SELECT id FROM employees WHERE username = ? AND id != ?',
        [employeeData.username, id]
      );
      
      if (duplicateUsername.length > 0) {
        return Response.json(
          { error: 'Username already exists' }, 
          { status: 400 }
        );
      }
    }
    
    // Hash password if provided
    let hashedPassword = null;
    if (employeeData.emailPassword) {
      hashedPassword = await bcrypt.hash(employeeData.emailPassword, 12);
    }
    
    const sql = `
      UPDATE employees SET
        username = ?, emailPassword = COALESCE(?, emailPassword), firstName = ?, lastName = ?, 
        gender = ?, empType = ?, department = ?, pfNo = ?, dob = ?, maritalStatus = ?, 
        presentAddress = ?, city = ?, pin = ?, state = ?, country = ?, phone = ?, 
        mobile = ?, email = ?, qualification = ?, institute = ?, passingYear = ?, 
        workExperience = ?, leaveStructure = ?, employeeStatus = ?, role = ?, 
        joiningDate = ?, basicSalary = ?, da = ?, hra = ?, conveyanceAllowance = ?, 
        otherAllowance = ?, bonus = ?, pf = ?, mlwf = ?, pt = ?, esic = ?, tds = ?,
        bonusAmount = ?, pfAmount = ?, mlwfPercentage = ?, ptAmount = ?, 
        esicPercentage = ?, tdsPercentage = ?, salaryPeriods = ?, updated_at = NOW()
      WHERE id = ?
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
      JSON.stringify(employeeData.salaryPeriods || []),
      id
    ];
    
    await query(sql, values);
    
    return Response.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to update employee' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if employee exists
    const existingEmployee = await query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );
    
    if (existingEmployee.length === 0) {
      return Response.json(
        { error: 'Employee not found' }, 
        { status: 404 }
      );
    }
    
    await query('DELETE FROM employees WHERE id = ?', [id]);
    
    return Response.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to delete employee' }, 
      { status: 500 }
    );
  }
}
