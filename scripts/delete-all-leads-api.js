const fetch = require('node-fetch');

async function deleteAllLeads() {
  try {
    console.log('🚀 Starting bulk delete of all leads...');
    console.log('⚠️  This will permanently delete ALL leads from the database!');
    console.log('🔗 Connecting to API at http://localhost:3001');
    
    // First, get all leads to see how many we have
    console.log('\n📊 Fetching current leads count...');
    const response = await fetch('http://localhost:3001/api/leads?limit=1000');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leads: ${response.status}`);
    }
    
    const data = await response.json();
    const leads = data.leads || [];
    const totalCount = data.pagination?.totalCount || leads.length;
    
    console.log(`📋 Found ${totalCount} leads to delete`);
    
    if (totalCount === 0) {
      console.log('✅ No leads found. Database is already clean!');
      return;
    }

    // Show some sample leads
    console.log('\n👀 Sample leads to be deleted:');
    leads.slice(0, 3).forEach((lead, index) => {
      console.log(`  ${index + 1}. ${lead.company_name} - ${lead.contact_name} (${lead.enquiry_no})`);
    });
    
    if (leads.length > 3) {
      console.log(`  ... and ${totalCount - 3} more leads`);
    }

    console.log('\n🗑️  Proceeding with deletion in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete leads one by one
    let deletedCount = 0;
    let failedCount = 0;
    const errors = [];

    console.log('\n⚡ Starting deletion process...');
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      try {
        const deleteResponse = await fetch(`http://localhost:3001/api/leads/${lead.id}`, {
          method: 'DELETE'
        });

        if (deleteResponse.ok) {
          deletedCount++;
          if (deletedCount % 10 === 0 || deletedCount === leads.length) {
            console.log(`✅ Deleted ${deletedCount}/${totalCount} leads...`);
          }
        } else {
          failedCount++;
          const error = `Failed to delete lead ${lead.id}: ${deleteResponse.status}`;
          errors.push(error);
          console.log(`❌ ${error}`);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = `Error deleting lead ${lead.id}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
      }

      // Small delay to prevent overwhelming the server
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Summary
    console.log('\n📈 DELETION SUMMARY:');
    console.log(`✅ Successfully deleted: ${deletedCount} leads`);
    console.log(`❌ Failed deletions: ${failedCount} leads`);
    console.log(`📊 Total processed: ${deletedCount + failedCount} leads`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.slice(0, 5).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more errors`);
      }
    }

    // Verify final count
    console.log('\n🔍 Verifying deletion...');
    const verifyResponse = await fetch('http://localhost:3001/api/leads?limit=1');
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const remainingCount = verifyData.pagination?.totalCount || 0;
      
      if (remainingCount === 0) {
        console.log('🎉 SUCCESS! All leads have been deleted from the database!');
      } else {
        console.log(`⚠️  WARNING: ${remainingCount} leads still remain in the database`);
      }
    }

  } catch (error) {
    console.error('💥 Fatal error during bulk deletion:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  deleteAllLeads()
    .then(() => {
      console.log('\n🏁 Bulk deletion script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = deleteAllLeads;
