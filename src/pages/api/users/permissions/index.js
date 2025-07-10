import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get permissions structure
    try {
      // Check if permissions table exists
      const tableCheck = await executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'permissions'"
      );
      
      if (tableCheck.length === 0) {
        // Return default permissions structure if table doesn't exist
        return res.status(200).json({
          modules: [
            {
              id: 'leads',
              name: 'Lead Management',
              permissions: [
                { key: 'leads.view', name: 'View Leads' },
                { key: 'leads.create', name: 'Create Leads' },
                { key: 'leads.edit', name: 'Edit Leads' },
                { key: 'leads.delete', name: 'Delete Leads' },
                { key: 'leads.assign', name: 'Assign Leads' }
              ]
            },
            {
              id: 'users',
              name: 'User Management',
              permissions: [
                { key: 'users.view', name: 'View Users' },
                { key: 'users.create', name: 'Create Users' },
                { key: 'users.edit', name: 'Edit Users' },
                { key: 'users.delete', name: 'Delete Users' }
              ]
            },
            {
              id: 'projects',
              name: 'Project Management',
              permissions: [
                { key: 'projects.view', name: 'View Projects' },
                { key: 'projects.create', name: 'Create Projects' },
                { key: 'projects.edit', name: 'Edit Projects' },
                { key: 'projects.delete', name: 'Delete Projects' }
              ]
            },
            {
              id: 'clients',
              name: 'Client Management',
              permissions: [
                { key: 'clients.view', name: 'View Clients' },
                { key: 'clients.create', name: 'Create Clients' },
                { key: 'clients.edit', name: 'Edit Clients' },
                { key: 'clients.delete', name: 'Delete Clients' }
              ]
            },
            {
              id: 'activities',
              name: 'Activities',
              permissions: [
                { key: 'activities.view', name: 'View Activities' },
                { key: 'activities.create', name: 'Create Activities' },
                { key: 'activities.edit', name: 'Edit Activities' },
                { key: 'activities.delete', name: 'Delete Activities' }
              ]
            },
            {
              id: 'reports',
              name: 'Reports',
              permissions: [
                { key: 'reports.view', name: 'View Reports' },
                { key: 'reports.export', name: 'Export Reports' }
              ]
            },
            {
              id: 'system',
              name: 'System Settings',
              permissions: [
                { key: 'system.settings', name: 'Manage System Settings' },
                { key: 'system.roles', name: 'Manage Roles' },
                { key: 'system.permissions', name: 'Manage Permissions' }
              ]
            }
          ],
          message: 'Default permissions retrieved successfully'
        });
      }
      
      // Get modules and permissions from database
      const modules = await executeQuery('SELECT * FROM permission_modules ORDER BY display_order');
      
      // For each module, get its permissions
      for (const moduleItem of modules) {
        const permissions = await executeQuery(
          'SELECT * FROM permissions WHERE module_id = ? ORDER BY display_order',
          [moduleItem.id]
        );
        
        moduleItem.permissions = permissions;
      }
      
      return res.status(200).json({
        modules: modules,
        message: 'Permissions retrieved successfully'
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      
      // Return default permissions if there's an error
      return res.status(200).json({
        modules: [
          {
            id: 'leads',
            name: 'Lead Management',
            permissions: [
              { key: 'leads.view', name: 'View Leads' },
              { key: 'leads.create', name: 'Create Leads' },
              { key: 'leads.edit', name: 'Edit Leads' },
              { key: 'leads.delete', name: 'Delete Leads' },
              { key: 'leads.assign', name: 'Assign Leads' }
            ]
          },
          {
            id: 'users',
            name: 'User Management',
            permissions: [
              { key: 'users.view', name: 'View Users' },
              { key: 'users.create', name: 'Create Users' },
              { key: 'users.edit', name: 'Edit Users' },
              { key: 'users.delete', name: 'Delete Users' }
            ]
          },
          // Other modules...
        ],
        message: 'Default permissions retrieved due to error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
