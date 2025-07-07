import fs from 'fs';
import path from 'path';

const CALENDAR_FILE = path.join(process.cwd(), 'data', 'calendar.json');

// Get calendar events
function getCalendarEvents() {
  try {
    if (!fs.existsSync(CALENDAR_FILE)) {
      return { events: [] };
    }
    const data = fs.readFileSync(CALENDAR_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading calendar file:', error);
    return { events: [] };
  }
}

export default function handler(req, res) {
  // Simple authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer valid-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const calendarData = getCalendarEvents();
    const events = calendarData.events || [];
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];

    // Calculate stats
    const stats = {
      totalEvents: events.length,
      todayEvents: events.filter(event => event.startDate === today).length,
      upcomingEvents: events.filter(event => new Date(event.startDate) > currentDate).length,
      pastEvents: events.filter(event => new Date(event.startDate) < currentDate).length,
      
      // Event type breakdown
      eventsByType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      
      // Priority breakdown
      eventsByPriority: events.reduce((acc, event) => {
        acc[event.priority] = (acc[event.priority] || 0) + 1;
        return acc;
      }, {}),
      
      // This week's events
      thisWeekEvents: events.filter(event => {
        const eventDate = new Date(event.startDate);
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventDate >= weekStart && eventDate <= weekEnd;
      }).length,
      
      // This month's events
      thisMonthEvents: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
      }).length,
      
      // Recent activity (events created in last 7 days)
      recentlyCreated: events.filter(event => {
        const createdDate = new Date(event.createdAt);
        const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= weekAgo;
      }).length,
      
      // Upcoming deadlines (next 7 days)
      upcomingDeadlines: events.filter(event => {
        const eventDate = new Date(event.startDate);
        const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= currentDate && eventDate <= nextWeek;
      }).length
    };

    // Calculate trends (compare with previous period)
    const lastMonth = new Date(currentDate);
    lastMonth.setMonth(currentDate.getMonth() - 1);
    
    const lastMonthEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getMonth() === lastMonth.getMonth() && 
             eventDate.getFullYear() === lastMonth.getFullYear();
    }).length;

    const monthlyTrend = stats.thisMonthEvents - lastMonthEvents;
    const monthlyTrendPercentage = lastMonthEvents > 0 
      ? ((monthlyTrend / lastMonthEvents) * 100).toFixed(1)
      : 0;

    // Add trend data
    stats.trends = {
      monthlyChange: monthlyTrend,
      monthlyChangePercentage: monthlyTrendPercentage,
      direction: monthlyTrend > 0 ? 'up' : monthlyTrend < 0 ? 'down' : 'neutral'
    };

    console.log(`[${new Date().toISOString()}] GET /api/calendar/stats - Generated stats for ${events.length} events`);
    
    res.status(200).json({
      success: true,
      stats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating calendar statistics:', error);
    res.status(500).json({ error: 'Failed to generate calendar statistics' });
  }
}
