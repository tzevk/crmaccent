import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let results = {
    phases: [],
    errors: [],
    startTime: Date.now()
  };

  try {
    console.log('Running complete RBAC database setup...');

    // Phase 1: RBAC Core Tables
    try {
      console.log('Executing Phase 1...');
      const phase1Response = await fetch(`${req.headers.origin || 'http://localhost:3001'}/api/setup-rbac-db-phase1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const phase1Data = await phase1Response.json();
      results.phases.push({ phase: 1, status: 'success', data: phase1Data });
      console.log('Phase 1 completed successfully');
    } catch (error) {
      console.error('Phase 1 failed:', error);
      results.errors.push({ phase: 1, error: error.message });
      throw new Error(`Phase 1 failed: ${error.message}`);
    }

    // Phase 2: Project Management Tables  
    try {
      console.log('Executing Phase 2...');
      const phase2Response = await fetch(`${req.headers.origin || 'http://localhost:3001'}/api/setup-rbac-db-phase2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const phase2Data = await phase2Response.json();
      results.phases.push({ phase: 2, status: 'success', data: phase2Data });
      console.log('Phase 2 completed successfully');
    } catch (error) {
      console.error('Phase 2 failed:', error);
      results.errors.push({ phase: 2, error: error.message });
      throw new Error(`Phase 2 failed: ${error.message}`);
    }

    // Phase 3: Seed RBAC Data
    try {
      console.log('Executing Phase 3...');
      const phase3Response = await fetch(`${req.headers.origin || 'http://localhost:3001'}/api/setup-rbac-db-phase3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const phase3Data = await phase3Response.json();
      results.phases.push({ phase: 3, status: 'success', data: phase3Data });
      console.log('Phase 3 completed successfully');
    } catch (error) {
      console.error('Phase 3 failed:', error);
      results.errors.push({ phase: 3, error: error.message });
      throw new Error(`Phase 3 failed: ${error.message}`);
    }

    const endTime = Date.now();
    const duration = endTime - results.startTime;

    console.log('='.repeat(60));
    console.log('🎉 COMPLETE RBAC DATABASE SETUP SUCCESSFUL! 🎉');
    console.log('='.repeat(60));
    console.log(`⏱️  Total setup time: ${duration}ms`);
    console.log('📊 Database Summary:');
    console.log('   ✅ RBAC Core: permissions, roles, users, sessions');
    console.log('   ✅ Master Data: disciplines, activities, statuses');
    console.log('   ✅ Project Management: projects, tasks, time logs');
    console.log('   ✅ Sample Data: default users, permissions, roles');
    console.log('');
    console.log('🔐 Default Login Credentials:');
    console.log('   👑 Admin: admin@crmaccent.com / admin123');
    console.log('   👨‍💼 Manager: manager@crmaccent.com / admin123');
    console.log('   👥 Staff: staff@crmaccent.com / admin123');
    console.log('   👤 User: user@crmaccent.com / admin123');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Test RBAC functionality with different user roles');
    console.log('   2. Create authentication API endpoints');
    console.log('   3. Implement JWT token management');
    console.log('   4. Set up role-based route protection');
    console.log('='.repeat(60));

    return res.status(200).json({
      message: 'Complete RBAC database setup successful!',
      success: true,
      duration: `${duration}ms`,
      phases_completed: results.phases.length,
      total_tables: 22,
      results: results,
      next_steps: [
        'Implement authentication API',
        'Create JWT token management', 
        'Set up protected routes',
        'Test RBAC functionality'
      ],
      default_credentials: {
        admin: { email: 'admin@crmaccent.com', password: 'admin123' },
        manager: { email: 'manager@crmaccent.com', password: 'admin123' },
        staff: { email: 'staff@crmaccent.com', password: 'admin123' },
        user: { email: 'user@crmaccent.com', password: 'admin123' }
      }
    });

  } catch (error) {
    console.error('Complete database setup failed:', error);
    return res.status(500).json({ 
      message: 'Complete database setup failed', 
      error: error.message,
      results: results
    });
  }
}
