import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';   // ✅ import getDb, not getConnection

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    const db = getDb();
    connection = await db.getConnection();

    const fieldMap = {
      proposalId: 'proposal_id',
      proposalTitle: 'proposal_title',
      proposalDate: 'proposal_date',
      preparedBy: 'prepared_by',
      clientName: 'client_name',
      contactPerson: 'contact_person',
      designation: 'designation',
      email: 'email',
      phoneNumber: 'phone_number',
      address: 'address',
      projectName: 'project_name',
      projectType: 'project_type',
      scopeOfWork: 'scope_of_work',
      estimatedValue: 'estimated_value',
      estimatedDuration: 'estimated_duration',
      currency: 'currency',
      currentStatus: 'current_status',
      submissionMode: 'submission_mode',
      followUpDate: 'follow_up_date',
      expectedDecisionDate: 'expected_decision_date',
      proposalOwner: 'proposal_owner',
      department: 'department',
      internalNotes: 'internal_notes',
      created_by: 'created_by'
    };

    const columns = [];
    const placeholders = [];
    const values = [];

    for (const [incomingKey, columnName] of Object.entries(fieldMap)) {
      if (Object.prototype.hasOwnProperty.call(data, incomingKey)) {
        const val = data[incomingKey];
        const normalized = val === '' ? null : val;
        columns.push(columnName);
        placeholders.push('?');
        values.push(normalized);
      }
    }

    const sql = `INSERT INTO proposals (${columns.join(',')}) VALUES (${placeholders.join(',')})`;
    const [result] = await connection.execute(sql, values);

    return NextResponse.json(
      {
        message: 'Proposal created successfully',
        proposal_id: result.insertId,
        proposal_reference: data.proposalId || null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create proposal' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// FETCH proposals
export async function GET() {
  let connection;
  try {
    const db = getDb();
    connection = await db.getConnection();

    const [rows] = await connection.query(
      'SELECT * FROM proposals ORDER BY proposal_date DESC'
    );

    return NextResponse.json(rows, { status: 200 }); // ✅ always JSON
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch proposals' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}