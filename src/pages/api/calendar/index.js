import fs from 'fs';
import path from 'path';

const CALENDAR_FILE = path.join(process.cwd(), 'data', 'calendar.json');

// Initialize calendar data file
function initializeCalendarFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(CALENDAR_FILE)) {
    fs.writeFileSync(CALENDAR_FILE, JSON.stringify({ events: [] }, null, 2));
  }
}

// Get calendar events
function getCalendarEvents() {
  try {
    initializeCalendarFile();
    const data = fs.readFileSync(CALENDAR_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading calendar file:', error);
    return { events: [] };
  }
}

// Save calendar events
function saveCalendarEvents(calendarData) {
  try {
    fs.writeFileSync(CALENDAR_FILE, JSON.stringify(calendarData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving calendar file:', error);
    return false;
  }
}

export default function handler(req, res) {
  // Simple authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer valid-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const calendarData = getCalendarEvents();

  switch (method) {
    case 'GET':
      try {
        const { startDate, endDate, type, userId } = req.query;
        let events = calendarData.events || [];

        // Filter by date range
        if (startDate || endDate) {
          events = events.filter(event => {
            const eventDate = new Date(event.startDate);
            const start = startDate ? new Date(startDate) : new Date('1900-01-01');
            const end = endDate ? new Date(endDate) : new Date('2100-12-31');
            return eventDate >= start && eventDate <= end;
          });
        }

        // Filter by type
        if (type && type !== 'all') {
          events = events.filter(event => event.type === type);
        }

        // Filter by user (for multi-user systems)
        if (userId) {
          events = events.filter(event => 
            event.userId === userId || 
            (event.attendees && event.attendees.includes(userId))
          );
        }

        // Sort by start date
        events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        console.log(`[${new Date().toISOString()}] GET /api/calendar - Retrieved ${events.length} events`);
        res.status(200).json({
          success: true,
          events,
          total: events.length
        });
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
      }
      break;

    case 'POST':
      try {
        const {
          title,
          description = '',
          startDate,
          endDate,
          startTime,
          endTime,
          type = 'meeting',
          priority = 'medium',
          location = '',
          attendees = [],
          reminder = 15,
          recurring = false,
          recurringType = 'none',
          userId = 'default'
        } = req.body;

        // Validation
        if (!title || !startDate || !startTime) {
          return res.status(400).json({ 
            error: 'Missing required fields: title, startDate, and startTime are required' 
          });
        }

        const newEvent = {
          id: Date.now().toString(),
          title: title.trim(),
          description: description.trim(),
          startDate,
          endDate: endDate || startDate,
          startTime,
          endTime: endTime || startTime,
          type,
          priority,
          location: location.trim(),
          attendees: Array.isArray(attendees) ? attendees : [],
          reminder,
          recurring,
          recurringType,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        calendarData.events = calendarData.events || [];
        calendarData.events.push(newEvent);

        if (saveCalendarEvents(calendarData)) {
          console.log(`[${new Date().toISOString()}] POST /api/calendar - Created event: ${title}`);
          res.status(201).json({
            success: true,
            event: newEvent,
            message: 'Calendar event created successfully'
          });
        } else {
          throw new Error('Failed to save calendar event');
        }
      } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ error: 'Failed to create calendar event' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Event ID is required for updates' });
        }

        const eventIndex = calendarData.events.findIndex(event => event.id === id);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Calendar event not found' });
        }

        // Update the event
        calendarData.events[eventIndex] = {
          ...calendarData.events[eventIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        if (saveCalendarEvents(calendarData)) {
          console.log(`[${new Date().toISOString()}] PUT /api/calendar - Updated event: ${id}`);
          res.status(200).json({
            success: true,
            event: calendarData.events[eventIndex],
            message: 'Calendar event updated successfully'
          });
        } else {
          throw new Error('Failed to save updated calendar event');
        }
      } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ error: 'Failed to update calendar event' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Event ID is required for deletion' });
        }

        const eventIndex = calendarData.events.findIndex(event => event.id === id);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Calendar event not found' });
        }

        const deletedEvent = calendarData.events.splice(eventIndex, 1)[0];

        if (saveCalendarEvents(calendarData)) {
          console.log(`[${new Date().toISOString()}] DELETE /api/calendar - Deleted event: ${id}`);
          res.status(200).json({
            success: true,
            message: 'Calendar event deleted successfully',
            deletedEvent
          });
        } else {
          throw new Error('Failed to save calendar data after deletion');
        }
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ error: 'Failed to delete calendar event' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
