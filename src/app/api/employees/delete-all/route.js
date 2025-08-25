import { query } from '@/lib/db';

export async function DELETE(request) {
  try {
    // Delete all employees
    const result = await query('DELETE FROM employees');
    
    // Reset auto-increment counter
    await query('ALTER TABLE employees AUTO_INCREMENT = 1');
    
    return Response.json({
      success: true,
      message: `Successfully deleted ${result.affectedRows} employees`,
      deletedCount: result.affectedRows
    });
    
  } catch (error) {
    console.error('Error deleting all employees:', error);
    return Response.json(
      { error: `Failed to delete employees: ${error.message}` },
      { status: 500 }
    );
  }
}
