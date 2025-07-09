# Project Management System Documentation

This document provides an overview of the Project Management System features implemented in the CRM application.

## Project Types

Projects in the system are categorized into two main types:

1. **PROPOSAL** - Projects that are in the proposal or quotation stage. These are potential projects that have not yet been confirmed by clients.
2. **ONGOING** - Active projects where work is currently being performed or scheduled.

## Project Flow

The typical project lifecycle follows these stages:

1. **Proposal Stage**
   - Project is created with type "PROPOSAL"
   - Quotation is prepared and sent to client
   - Status is set to "planning"

2. **Conversion Stage**
   - Client approves the proposal
   - Purchase Order (PO) is received from client
   - Project type is changed from "PROPOSAL" to "ONGOING"
   - Status is changed from "planning" to "active"

3. **Execution Stage**
   - Tasks and activities are created and assigned to team members
   - Progress is tracked through task completion
   - Status is maintained as "active" or can be changed to "on_hold" if necessary

4. **Completion Stage**
   - All tasks are completed
   - Invoice is generated
   - Status is changed to "completed"

## Document Management

Each project can have three key document types associated with it:

1. **Quotation** - The initial price quote sent to the client
   - Fields: has_quotation (boolean), quotation_number, quotation_date

2. **Purchase Order** - The official order document received from the client
   - Fields: has_po (boolean), po_number, po_date

3. **Invoice** - The billing document sent to the client upon project completion or milestones
   - Fields: has_invoice (boolean), invoice_number, invoice_date

## Project Numbering System

Each project is automatically assigned a unique project number when created. The format is:

```
PRJ-YY-MM-XXXX
```

Where:
- YY = Last two digits of the current year
- MM = Two-digit month
- XXXX = Sequential four-digit number that increments for each project created in that month

Example: `PRJ-23-05-0001` would be the first project created in May 2023.

## Team Assignment

Projects can be assigned to multiple team members:

- Project creators can assign team members during project creation or later
- Each team member's role can be specified
- Team assignments are tracked in the `project_team` table

## Tasks and Activities System

Projects can have multiple tasks/activities:

- Each task has a title, description, assignee, due date, and status
- Tasks can be prioritized (low, medium, high, urgent)
- Time tracking is available through estimated hours and actual hours fields
- Task progress is reflected in the overall project progress

## Project Statuses

Projects can have the following statuses:

1. **Planning** - Initial setup and preparation phase
2. **Active** - Work is currently in progress
3. **On Hold** - Temporarily paused
4. **Completed** - All work has been finished
5. **Cancelled** - Project has been terminated before completion

## Database Schema

The project management system uses several tables to store project data:

- `projects` - Core project information
- `project_team` - Team assignments (many-to-many relationship)
- `project_tasks` - Tasks and activities related to projects

Refer to the `database/setup.sql` file for the complete schema definition.

## Project API

Project data can be accessed and manipulated through the following API functions:

- `projectsAPI.getAll()` - Get all projects with optional filters
- `projectsAPI.getById(id)` - Get a single project by ID
- `projectsAPI.create(projectData)` - Create a new project
- `projectsAPI.update(id, projectData)` - Update an existing project
- `projectsAPI.delete(id)` - Delete a project
- `projectsAPI.getStats()` - Get project statistics
- `projectsAPI.getTasks(projectId)` - Get tasks for a specific project
- `projectsAPI.createTask(taskData)` - Create a new task
- `projectsAPI.updateTask(taskId, taskData)` - Update a task
- `projectsAPI.deleteTask(taskId)` - Delete a task

## User Interface

The project management system includes the following UI components:

- Project listing page with filtering options
- Project creation form with document management
- Project details view with task management
- Task creation and management interfaces

## Integration with Other Modules

The project management system integrates with:

- **Client Management** - Projects are associated with specific clients
- **User Management** - Projects and tasks are assigned to users
- **Reporting** - Project data is available for reporting purposes

## Future Enhancements

Planned future enhancements for the project management system include:

- Gantt chart visualization
- Resource allocation tracking
- Budget tracking and financial reporting
- Client portal for project status updates
- File attachment system for project documents
