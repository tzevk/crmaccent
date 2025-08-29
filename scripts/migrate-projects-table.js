const mysql = require('mysql2/promise');

async function migrateProjectsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crmaccent',
    port: parseInt(process.env.DB_PORT) || 3306
  });

  try {
    console.log('Starting projects table migration...');

    // First, let's check if the table exists and what structure it has
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'projects'"
    );

    if (tables.length > 0) {
      console.log('Projects table exists, checking structure...');
      
      // Get current table structure
      const [columns] = await connection.execute('DESCRIBE projects');
      const columnNames = columns.map(col => col.Field);
      
      console.log('Current columns:', columnNames);
      
      // Check if we need to add new columns
      const requiredColumns = [
        'project_number',
        'project_name', 
        'client_name',
        'city',
        'received_date',
        'project_type',
        'project_cost',
        'currency',
        'start_date',
        'end_date',
        'duration',
        'manhours',
        'project_head',
        'project_manager',
        'project_lead',
        'area_engineer',
        'project_team',
        'status',
        'proposal_id'
      ];

      for (const column of requiredColumns) {
        if (!columnNames.includes(column)) {
          console.log(`Adding missing column: ${column}`);
          
          let alterQuery = '';
          switch(column) {
            case 'project_number':
              alterQuery = 'ALTER TABLE projects ADD COLUMN project_number VARCHAR(50) UNIQUE';
              break;
            case 'city':
              alterQuery = 'ALTER TABLE projects ADD COLUMN city VARCHAR(100)';
              break;
            case 'received_date':
              alterQuery = 'ALTER TABLE projects ADD COLUMN received_date DATE';
              break;
            case 'project_type':
              alterQuery = "ALTER TABLE projects ADD COLUMN project_type ENUM('Proposal', 'Project') DEFAULT 'Project'";
              break;
            case 'project_cost':
              alterQuery = 'ALTER TABLE projects ADD COLUMN project_cost DECIMAL(15, 2)';
              break;
            case 'currency':
              alterQuery = "ALTER TABLE projects ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'";
              break;
            case 'start_date':
              alterQuery = 'ALTER TABLE projects ADD COLUMN start_date DATE';
              break;
            case 'end_date':
              alterQuery = 'ALTER TABLE projects ADD COLUMN end_date DATE';
              break;
            case 'duration':
              alterQuery = 'ALTER TABLE projects ADD COLUMN duration VARCHAR(50)';
              break;
            case 'manhours':
              alterQuery = 'ALTER TABLE projects ADD COLUMN manhours INT';
              break;
            case 'project_head':
              alterQuery = 'ALTER TABLE projects ADD COLUMN project_head VARCHAR(255)';
              break;
            case 'project_manager':
              alterQuery = 'ALTER TABLE projects ADD COLUMN project_manager VARCHAR(255)';
              break;
            case 'project_lead':
              alterQuery = 'ALTER TABLE projects ADD COLUMN project_lead VARCHAR(255)';
              break;
            case 'area_engineer':
              alterQuery = 'ALTER TABLE projects ADD COLUMN area_engineer VARCHAR(255)';
              break;
            case 'project_team':
              alterQuery = 'ALTER TABLE projects ADD COLUMN project_team TEXT';
              break;
            case 'status':
              alterQuery = "ALTER TABLE projects ADD COLUMN status ENUM('Ongoing', 'Hold', 'Proposal', 'Closed', 'Cancelled', 'Regret') DEFAULT 'Ongoing'";
              break;
            case 'proposal_id':
              alterQuery = 'ALTER TABLE projects ADD COLUMN proposal_id INT';
              break;
          }
          
          if (alterQuery) {
            await connection.execute(alterQuery);
            console.log(`✓ Added column: ${column}`);
          }
        }
      }

      // Add indexes
      try {
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_project_number ON projects (project_number)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_client_name ON projects (client_name)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_status ON projects (status)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_project_type ON projects (project_type)');
        console.log('✓ Added indexes');
      } catch (err) {
        console.log('Indexes may already exist:', err.message);
      }

    } else {
      console.log('Creating new projects table...');
      
      await connection.execute(`
        CREATE TABLE projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_number VARCHAR(50) UNIQUE NOT NULL,
          project_name VARCHAR(255) NOT NULL,
          client_name VARCHAR(255) NOT NULL,
          city VARCHAR(100),
          received_date DATE,
          project_type ENUM('Proposal', 'Project') DEFAULT 'Project',
          project_cost DECIMAL(15, 2),
          currency VARCHAR(10) DEFAULT 'INR',
          start_date DATE,
          end_date DATE,
          duration VARCHAR(50),
          manhours INT,
          project_head VARCHAR(255),
          project_manager VARCHAR(255),
          project_lead VARCHAR(255),
          area_engineer VARCHAR(255),
          project_team TEXT,
          status ENUM('Ongoing', 'Hold', 'Proposal', 'Closed', 'Cancelled', 'Regret') DEFAULT 'Ongoing',
          proposal_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_project_number (project_number),
          INDEX idx_client_name (client_name),
          INDEX idx_status (status),
          INDEX idx_project_type (project_type)
        )
      `);
      
      console.log('✓ Created projects table');

      // Insert sample data
      await connection.execute(`
        INSERT INTO projects (
          project_number, project_name, client_name, city, received_date, 
          project_type, project_cost, start_date, end_date, duration, manhours,
          project_head, project_manager, project_lead, area_engineer, project_team, status
        ) VALUES 
        (
          'PRJ_001_2025', 'Office Building Construction', 'ABC Corp', 'Mumbai', '2025-01-15',
          'Project', 5000000.00, '2025-02-01', '2025-08-01', '6 months', 2400,
          'John Smith', 'Sarah Johnson', 'Mike Wilson', 'David Brown', 
          '["John Smith", "Sarah Johnson", "Mike Wilson", "David Brown", "Emma Davis"]', 'Ongoing'
        ),
        (
          'PRJ_002_2025', 'Residential Complex', 'XYZ Developers', 'Delhi', '2025-01-20',
          'Project', 12000000.00, '2025-03-01', '2025-12-01', '10 months', 4000,
          'Alice Cooper', 'Bob Martin', 'Carol White', 'Dan Green',
          '["Alice Cooper", "Bob Martin", "Carol White", "Dan Green", "Frank Blue"]', 'Ongoing'
        ),
        (
          'PRJ_003_2025', 'Shopping Mall Renovation', 'Retail Group Ltd', 'Bangalore', '2025-02-01',
          'Proposal', 8000000.00, NULL, NULL, '8 months', 3200,
          'Tom Anderson', 'Lisa Parker', 'Ryan Clark', 'Amy Taylor',
          '["Tom Anderson", "Lisa Parker", "Ryan Clark", "Amy Taylor"]', 'Proposal'
        )
      `);

      console.log('✓ Inserted sample data');
    }

    console.log('Projects table migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  migrateProjectsTable();
}

module.exports = { migrateProjectsTable };
