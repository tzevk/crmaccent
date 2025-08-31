const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  multipleStatements: true
};

async function setupTemplatesDatabase() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating proposal_templates table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proposal_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        default_currency VARCHAR(10) DEFAULT 'INR',
        is_active BOOLEAN DEFAULT 1,
        created_by VARCHAR(255) DEFAULT 'System',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('Creating proposal_template_sections table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proposal_template_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        section_order INT NOT NULL DEFAULT 1,
        is_required BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES proposal_templates(id) ON DELETE CASCADE,
        INDEX idx_template_id (template_id),
        INDEX idx_section_order (section_order)
      )
    `);

    // Check if templates exist
    const [existingTemplates] = await connection.query('SELECT COUNT(*) as count FROM proposal_templates');
    
    if (existingTemplates[0].count === 0) {
      console.log('Inserting default templates...');
      
      // Insert Software Development template
      const [softwareResult] = await connection.execute(`
        INSERT INTO proposal_templates (name, category, description, default_currency, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Software Development Proposal',
        'Software Development',
        'Comprehensive template for software development projects including web apps, mobile apps, and custom solutions.',
        'INR',
        1,
        'System'
      ]);
      
      const softwareTemplateId = softwareResult.insertId;
      
      // Insert sections for Software Development template
      const softwareSections = [
        { title: 'Executive Summary', content: 'Overview of the software solution and its business benefits.', order: 1, is_required: 1 },
        { title: 'Technical Requirements', content: 'Detailed technical specifications and requirements.', order: 2, is_required: 1 },
        { title: 'Development Approach', content: 'Methodology, technologies, and development process.', order: 3, is_required: 1 },
        { title: 'Timeline & Milestones', content: 'Project timeline with key deliverables and milestones.', order: 4, is_required: 1 },
        { title: 'Investment & Payment Terms', content: 'Cost breakdown and payment schedule.', order: 5, is_required: 1 },
        { title: 'Support & Maintenance', content: 'Post-delivery support and maintenance terms.', order: 6, is_required: 0 }
      ];
      
      for (const section of softwareSections) {
        await connection.execute(`
          INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required)
          VALUES (?, ?, ?, ?, ?)
        `, [softwareTemplateId, section.title, section.content, section.order, section.is_required]);
      }

      // Insert Marketing template
      const [marketingResult] = await connection.execute(`
        INSERT INTO proposal_templates (name, category, description, default_currency, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Marketing Campaign Proposal',
        'Marketing',
        'Template for digital marketing campaigns, brand strategies, and promotional activities.',
        'INR',
        1,
        'System'
      ]);
      
      const marketingTemplateId = marketingResult.insertId;
      
      // Insert sections for Marketing template
      const marketingSections = [
        { title: 'Campaign Overview', content: 'Goals, target audience, and campaign objectives.', order: 1, is_required: 1 },
        { title: 'Strategy & Approach', content: 'Marketing strategy and tactical approach.', order: 2, is_required: 1 },
        { title: 'Channel Mix', content: 'Digital channels and media mix recommendations.', order: 3, is_required: 1 },
        { title: 'Creative Concepts', content: 'Creative direction and content strategy.', order: 4, is_required: 0 },
        { title: 'Timeline & Deliverables', content: 'Campaign timeline and key deliverables.', order: 5, is_required: 1 },
        { title: 'Investment & ROI', content: 'Budget breakdown and expected ROI.', order: 6, is_required: 1 }
      ];
      
      for (const section of marketingSections) {
        await connection.execute(`
          INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required)
          VALUES (?, ?, ?, ?, ?)
        `, [marketingTemplateId, section.title, section.content, section.order, section.is_required]);
      }

      // Insert Consulting template
      const [consultingResult] = await connection.execute(`
        INSERT INTO proposal_templates (name, category, description, default_currency, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Consulting Services Proposal',
        'Consulting',
        'Professional template for consulting services, business analysis, and strategic advisory.',
        'INR',
        1,
        'System'
      ]);
      
      const consultingTemplateId = consultingResult.insertId;
      
      // Insert sections for Consulting template
      const consultingSections = [
        { title: 'Executive Summary', content: 'Brief overview of consulting engagement and outcomes.', order: 1, is_required: 1 },
        { title: 'Current Situation Analysis', content: 'Assessment of current state and challenges.', order: 2, is_required: 1 },
        { title: 'Proposed Solution', content: 'Recommended approach and methodology.', order: 3, is_required: 1 },
        { title: 'Implementation Plan', content: 'Detailed implementation roadmap.', order: 4, is_required: 1 },
        { title: 'Team & Expertise', content: 'Consultant profiles and relevant experience.', order: 5, is_required: 0 },
        { title: 'Investment & Terms', content: 'Engagement fees and terms of service.', order: 6, is_required: 1 }
      ];
      
      for (const section of consultingSections) {
        await connection.execute(`
          INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required)
          VALUES (?, ?, ?, ?, ?)
        `, [consultingTemplateId, section.title, section.content, section.order, section.is_required]);
      }
    }

    // Verify setup
    const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM proposal_templates');
    const [sectionsCount] = await connection.query('SELECT COUNT(*) as count FROM proposal_template_sections');

    console.log('✅ Database setup completed successfully!');
    console.log(`✅ Templates created: ${finalCount[0].count}`);
    console.log(`✅ Sections created: ${sectionsCount[0].count}`);

    return {
      success: true,
      templates_count: finalCount[0].count,
      sections_count: sectionsCount[0].count
    };

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupTemplatesDatabase()
    .then((result) => {
      console.log('Setup result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupTemplatesDatabase;
