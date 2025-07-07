import { executeQuery } from '../../lib/db';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../utils/rbac.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up Phase 3: Seeding RBAC data...');

    // ========== SEED PERMISSIONS ==========
    console.log('Seeding permissions...');
    
    const permissionCategories = {};
    Object.entries(PERMISSIONS).forEach(([key, permission]) => {
      const [category, action] = permission.split(':');
      if (!permissionCategories[category]) {
        permissionCategories[category] = [];
      }
      permissionCategories[category].push({
        name: permission,
        description: `Permission to ${action.replace('_', ' ')} ${category}`,
        category: category
      });
    });

    for (const [category, permissions] of Object.entries(permissionCategories)) {
      for (const perm of permissions) {
        await executeQuery(
          'INSERT IGNORE INTO permissions (name, description, category) VALUES (?, ?, ?)',
          [perm.name, perm.description, perm.category]
        );
      }
    }
    console.log('Permissions seeded successfully');

    // ========== SEED ROLES ==========
    console.log('Seeding roles...');
    
    const roles = [
      {
        name: 'admin',
        display_name: 'Administrator',
        description: 'Full system access with all permissions'
      },
      {
        name: 'manager',
        display_name: 'Project Manager',
        description: 'Can manage projects, teams, and view most data'
      },
      {
        name: 'staff',
        display_name: 'Staff Member',
        description: 'Limited access to assigned projects and tasks'
      },
      {
        name: 'user',
        display_name: 'Basic User',
        description: 'Basic viewing access to assigned items'
      }
    ];

    for (const role of roles) {
      await executeQuery(
        'INSERT IGNORE INTO roles (name, display_name, description) VALUES (?, ?, ?)',
        [role.name, role.display_name, role.description]
      );
    }
    console.log('Roles seeded successfully');

    // ========== SEED ROLE PERMISSIONS ==========
    console.log('Seeding role permissions...');
    
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      // Get role ID
      const roleResult = await executeQuery('SELECT id FROM roles WHERE name = ?', [roleName]);
      if (roleResult.length === 0) continue;
      
      const roleId = roleResult[0].id;
      
      for (const permission of permissions) {
        // Get permission ID
        const permResult = await executeQuery('SELECT id FROM permissions WHERE name = ?', [permission]);
        if (permResult.length === 0) continue;
        
        const permissionId = permResult[0].id;
        
        // Insert role permission
        await executeQuery(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleId, permissionId]
        );
      }
    }
    console.log('Role permissions seeded successfully');

    // ========== SEED DEFAULT USERS ==========
    console.log('Seeding default users...');
    
    const defaultPassword = await bcrypt.hash('admin123', 10);
    
    const defaultUsers = [
      {
        email: 'admin@crmaccent.com',
        password_hash: defaultPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role_name: 'admin',
        is_active: true,
        email_verified: true
      },
      {
        email: 'manager@crmaccent.com',
        password_hash: defaultPassword,
        first_name: 'Project',
        last_name: 'Manager',
        role_name: 'manager',
        is_active: true,
        email_verified: true
      },
      {
        email: 'staff@crmaccent.com',
        password_hash: defaultPassword,
        first_name: 'Staff',
        last_name: 'Member',
        role_name: 'staff',
        is_active: true,
        email_verified: true
      },
      {
        email: 'user@crmaccent.com',
        password_hash: defaultPassword,
        first_name: 'Basic',
        last_name: 'User',
        role_name: 'user',
        is_active: true,
        email_verified: true
      }
    ];

    for (const user of defaultUsers) {
      // Get role ID
      const roleResult = await executeQuery('SELECT id FROM roles WHERE name = ?', [user.role_name]);
      if (roleResult.length === 0) continue;
      
      const roleId = roleResult[0].id;
      
      // Insert user
      await executeQuery(`
        INSERT IGNORE INTO users (
          email, password_hash, first_name, last_name, role_id, 
          is_active, email_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user.email, user.password_hash, user.first_name, user.last_name,
        roleId, user.is_active, user.email_verified
      ]);
    }
    console.log('Default users seeded successfully');

    // ========== SEED STATUSES ==========
    console.log('Seeding default statuses...');
    
    const statuses = [
      // Project statuses
      { name: 'planning', display_name: 'Planning', type: 'project', color: '#3B82F6', sort_order: 1 },
      { name: 'active', display_name: 'Active', type: 'project', color: '#10B981', sort_order: 2 },
      { name: 'on_hold', display_name: 'On Hold', type: 'project', color: '#F59E0B', sort_order: 3 },
      { name: 'completed', display_name: 'Completed', type: 'project', color: '#6B7280', sort_order: 4 },
      { name: 'cancelled', display_name: 'Cancelled', type: 'project', color: '#EF4444', sort_order: 5 },
      
      // Task statuses
      { name: 'todo', display_name: 'To Do', type: 'task', color: '#6B7280', sort_order: 1 },
      { name: 'in_progress', display_name: 'In Progress', type: 'task', color: '#3B82F6', sort_order: 2 },
      { name: 'review', display_name: 'Under Review', type: 'task', color: '#F59E0B', sort_order: 3 },
      { name: 'completed', display_name: 'Completed', type: 'task', color: '#10B981', sort_order: 4 },
      { name: 'blocked', display_name: 'Blocked', type: 'task', color: '#EF4444', sort_order: 5 },
      
      // Lead statuses
      { name: 'new', display_name: 'New Lead', type: 'lead', color: '#3B82F6', sort_order: 1 },
      { name: 'contacted', display_name: 'Contacted', type: 'lead', color: '#8B5CF6', sort_order: 2 },
      { name: 'qualified', display_name: 'Qualified', type: 'lead', color: '#F59E0B', sort_order: 3 },
      { name: 'proposal', display_name: 'Proposal Sent', type: 'lead', color: '#06B6D4', sort_order: 4 },
      { name: 'converted', display_name: 'Converted', type: 'lead', color: '#10B981', sort_order: 5 },
      { name: 'lost', display_name: 'Lost', type: 'lead', color: '#EF4444', sort_order: 6 }
    ];

    for (const status of statuses) {
      await executeQuery(`
        INSERT IGNORE INTO statuses (name, display_name, type, color, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, [status.name, status.display_name, status.type, status.color, status.sort_order]);
    }
    console.log('Statuses seeded successfully');

    // ========== SEED SAMPLE DISCIPLINES ==========
    console.log('Seeding sample disciplines...');
    
    const disciplines = [
      { name: 'Architecture', description: 'Architectural design and planning', color: '#3B82F6' },
      { name: 'Engineering', description: 'Engineering and technical work', color: '#10B981' },
      { name: 'Project Management', description: 'Project planning and coordination', color: '#F59E0B' },
      { name: 'Design', description: 'Creative and visual design', color: '#8B5CF6' },
      { name: 'Construction', description: 'Construction and building work', color: '#EF4444' },
      { name: 'Consulting', description: 'Advisory and consulting services', color: '#06B6D4' }
    ];

    // Get admin user ID for created_by
    const adminUser = await executeQuery('SELECT id FROM users WHERE email = ?', ['admin@crmaccent.com']);
    const adminId = adminUser.length > 0 ? adminUser[0].id : null;

    for (const discipline of disciplines) {
      await executeQuery(`
        INSERT IGNORE INTO disciplines (name, description, color, created_by)
        VALUES (?, ?, ?, ?)
      `, [discipline.name, discipline.description, discipline.color, adminId]);
    }
    console.log('Sample disciplines seeded successfully');

    // ========== SEED SAMPLE ACTIVITIES ==========
    console.log('Seeding sample activities...');
    
    const activities = [
      { name: 'Planning', description: 'Project planning and preparation', category: 'Management', default_hours: 8 },
      { name: 'Design', description: 'Design and conceptual work', category: 'Creative', default_hours: 16 },
      { name: 'Development', description: 'Development and implementation', category: 'Technical', default_hours: 24 },
      { name: 'Review', description: 'Review and quality assurance', category: 'Quality', default_hours: 4 },
      { name: 'Meeting', description: 'Client and team meetings', category: 'Communication', default_hours: 2 },
      { name: 'Documentation', description: 'Documentation and reporting', category: 'Administration', default_hours: 4 },
      { name: 'Testing', description: 'Testing and validation', category: 'Quality', default_hours: 8 },
      { name: 'Research', description: 'Research and analysis', category: 'Analysis', default_hours: 6 }
    ];

    for (const activity of activities) {
      await executeQuery(`
        INSERT IGNORE INTO activity_master (activity_name, description, category, default_hours, created_by)
        VALUES (?, ?, ?, ?, ?)
      `, [activity.name, activity.description, activity.category, activity.default_hours, adminId]);
    }
    console.log('Sample activities seeded successfully');

    console.log('Phase 3 completed - RBAC data seeded successfully');
    
    return res.status(200).json({ 
      message: 'Phase 3 completed successfully - Database fully configured with RBAC',
      phase: 3,
      seeded_data: {
        permissions: Object.keys(PERMISSIONS).length,
        roles: roles.length,
        users: defaultUsers.length,
        statuses: statuses.length,
        disciplines: disciplines.length,
        activities: activities.length
      },
      default_login: {
        admin: { email: 'admin@crmaccent.com', password: 'admin123' },
        manager: { email: 'manager@crmaccent.com', password: 'admin123' },
        staff: { email: 'staff@crmaccent.com', password: 'admin123' },
        user: { email: 'user@crmaccent.com', password: 'admin123' }
      }
    });

  } catch (error) {
    console.error('Phase 3 Database seeding error:', error);
    return res.status(500).json({ 
      message: 'Phase 3 Database seeding failed', 
      error: error.message 
    });
  }
}
