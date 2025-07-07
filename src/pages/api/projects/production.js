// Production-friendly projects API
import { getUserFromToken } from '@/utils/authUtils';

// Mock data for production testing
const mockProjects = [
  {
    id: 1,
    name: "CRM System Development",
    description: "Comprehensive customer relationship management system",
    status: "active",
    priority: "high",
    start_date: "2024-12-31T18:30:00.000Z",
    end_date: "2025-06-29T18:30:00.000Z",
    estimated_hours: "800.00",
    actual_hours: "0.00",
    budget: "500000.00",
    cost: "0.00",
    progress_percentage: "45.00",
    project_manager_id: 1,
    team_members: "[\"1\", \"2\", \"3\"]",
    tags: "CRM, Development, Web Application",
    notes: "Primary project for Q1-Q2 2025. Critical for business growth.",
    created_by: 1,
    created_at: "2025-07-06T11:57:39.000Z",
    updated_at: "2025-07-06T11:57:39.000Z",
    created_by_name: "Admin",
    created_by_lastname: "User"
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Native mobile application for iOS and Android platforms",
    status: "planning",
    priority: "medium",
    start_date: "2025-02-28T18:30:00.000Z",
    end_date: "2025-08-30T18:30:00.000Z",
    estimated_hours: "600.00",
    actual_hours: "0.00",
    budget: "300000.00",
    cost: "0.00",
    progress_percentage: "15.00",
    project_manager_id: 1,
    team_members: "[\"2\", \"4\"]",
    tags: "Mobile, iOS, Android, React Native",
    notes: "Secondary project dependent on CRM completion.",
    created_by: 1,
    created_at: "2025-07-06T11:57:39.000Z",
    updated_at: "2025-07-06T11:57:39.000Z",
    created_by_name: "Admin",
    created_by_lastname: "User"
  },
  {
    id: 3,
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    status: "completed",
    priority: "low",
    start_date: "2024-09-30T18:30:00.000Z",
    end_date: "2024-12-30T18:30:00.000Z",
    estimated_hours: "200.00",
    actual_hours: "185.00",
    budget: "75000.00",
    cost: "68000.00",
    progress_percentage: "100.00",
    project_manager_id: 1,
    team_members: "[\"3\", \"5\"]",
    tags: "Website, Design, Frontend",
    notes: "Successfully completed ahead of schedule.",
    created_by: 1,
    created_at: "2025-07-06T11:57:39.000Z",
    updated_at: "2025-07-06T11:57:39.000Z",
    created_by_name: "Admin",
    created_by_lastname: "User"
  },
  {
    id: 4,
    name: "E-commerce Integration",
    description: "Integration of e-commerce functionality into existing systems",
    status: "active",
    priority: "high",
    start_date: "2025-01-15T18:30:00.000Z",
    end_date: "2025-05-15T18:30:00.000Z",
    estimated_hours: "400.00",
    actual_hours: "125.00",
    budget: "200000.00",
    cost: "45000.00",
    progress_percentage: "30.00",
    project_manager_id: 1,
    team_members: "[\"1\", \"3\", \"4\"]",
    tags: "E-commerce, Integration, API",
    notes: "Critical for Q2 revenue targets.",
    created_by: 1,
    created_at: "2025-07-06T11:57:39.000Z",
    updated_at: "2025-07-06T11:57:39.000Z",
    created_by_name: "Admin",
    created_by_lastname: "User"
  }
];

export default async function handler(req, res) {
  try {
    // Authenticate user
    let user = null;
    try {
      user = await getUserFromToken(req);
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        error: error.message,
        production_note: 'Use /api/auth/production-token to get a token'
      });
    }

    // Check if user has permission (simplified for production)
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions to view projects',
        userRole: user?.role
      });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          projects: mockProjects,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: mockProjects.length,
            hasNextPage: false,
            hasPreviousPage: false
          },
          production_note: 'Using mock data for production testing'
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects', 
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
