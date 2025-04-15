const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const port = process.env.PORT || 80;

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventBridge = new AWS.EventBridge();
const s3 = new AWS.S3();

// Environment variables
const EVENTS_TABLE = process.env.EVENTS_TABLE;
const REGISTRATIONS_TABLE = process.env.REGISTRATIONS_TABLE;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;
const ENVIRONMENT = process.env.ENVIRONMENT;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send('Event Management Reporting Service is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// API endpoint to generate reports
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { reportType, parameters } = req.body;
    
    let report;
    switch (reportType) {
      case 'event-attendance':
        report = await generateEventAttendanceReport(parameters.eventId);
        break;
      case 'monthly-summary':
        report = await generateMonthlySummaryReport(parameters.year, parameters.month);
        break;
      case 'user-activity':
        report = await generateUserActivityReport(parameters.userId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
    
    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error generating report', message: error.message });
  }
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    // In a real implementation, this would fetch report metadata from DynamoDB
    const reports = [
      { id: '1', name: 'Monthly Summary - January 2023', type: 'monthly-summary', createdAt: '2023-02-01T00:00:00Z' },
      { id: '2', name: 'Event Attendance - Tech Conference', type: 'event-attendance', createdAt: '2023-03-15T00:00:00Z' }
    ];
    
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error fetching reports', message: error.message });
  }
});

// Generate event attendance report
async function generateEventAttendanceReport(eventId) {
  console.log(`Generating attendance report for event: ${eventId}`);
  
  // Get event details
  const eventParams = {
    TableName: EVENTS_TABLE,
    Key: { id: eventId }
  };
  
  const eventResult = await dynamodb.get(eventParams).promise();
  const event = eventResult.Item;
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Get registrations for this event
  const registrationsParams = {
    TableName: REGISTRATIONS_TABLE,
    IndexName: 'EventRegistrations',
    KeyConditionExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':eventId': eventId
    }
  };
  
  const registrationsResult = await dynamodb.query(registrationsParams).promise();
  const registrations = registrationsResult.Items || [];
  
  // Calculate statistics
  const totalRegistrations = registrations.length;
  const checkedIn = registrations.filter(r => r.checkedIn).length;
  const noShows = totalRegistrations - checkedIn;
  const checkInRate = totalRegistrations > 0 ? (checkedIn / totalRegistrations) * 100 : 0;
  
  // Create report
  const report = {
    id: `event-attendance-${eventId}-${Date.now()}`,
    type: 'event-attendance',
    eventId: eventId,
    eventName: event.name,
    eventDate: event.eventDate,
    location: event.location,
    statistics: {
      totalRegistrations,
      checkedIn,
      noShows,
      checkInRate: `${checkInRate.toFixed(2)}%`
    },
    generatedAt: new Date().toISOString()
  };
  
  // In a real implementation, you would store the report in S3 or DynamoDB
  console.log('Generated report:', JSON.stringify(report, null, 2));
  
  return report;
}

// Generate monthly summary report
async function generateMonthlySummaryReport(year, month) {
  console.log(`Generating monthly summary report for ${year}-${month}`);
  
  // Format month for date comparison
  const monthStr = month.toString().padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-31`; // This is simplified; in production use proper date handling
  
  // Get events for the month
  const eventsParams = {
    TableName: EVENTS_TABLE,
    FilterExpression: 'eventDate BETWEEN :startDate AND :endDate',
    ExpressionAttributeValues: {
      ':startDate': startDate,
      ':endDate': endDate
    }
  };
  
  const eventsResult = await dynamodb.scan(eventsParams).promise();
  const events = eventsResult.Items || [];
  
  // Calculate statistics
  const totalEvents = events.length;
  const eventsByType = {};
  
  // Group events by type
  events.forEach(event => {
    const eventType = event.eventType || 'Other';
    eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
  });
  
  // Create report
  const report = {
    id: `monthly-summary-${year}-${month}-${Date.now()}`,
    type: 'monthly-summary',
    period: `${year}-${monthStr}`,
    statistics: {
      totalEvents,
      eventsByType
    },
    events: events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.eventDate,
      type: event.eventType || 'Other'
    })),
    generatedAt: new Date().toISOString()
  };
  
  // In a real implementation, you would store the report in S3 or DynamoDB
  console.log('Generated report:', JSON.stringify(report, null, 2));
  
  return report;
}

// Generate user activity report
async function generateUserActivityReport(userId) {
  console.log(`Generating user activity report for user: ${userId}`);
  
  // Get user registrations
  const registrationsParams = {
    TableName: REGISTRATIONS_TABLE,
    IndexName: 'UserRegistrations',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const registrationsResult = await dynamodb.query(registrationsParams).promise();
  const registrations = registrationsResult.Items || [];
  
  // Get event details for each registration
  const eventIds = [...new Set(registrations.map(reg => reg.eventId))];
  const events = {};
  
  for (const eventId of eventIds) {
    const eventParams = {
      TableName: EVENTS_TABLE,
      Key: { id: eventId }
    };
    
    const eventResult = await dynamodb.get(eventParams).promise();
    if (eventResult.Item) {
      events[eventId] = eventResult.Item;
    }
  }
  
  // Create report
  const report = {
    id: `user-activity-${userId}-${Date.now()}`,
    type: 'user-activity',
    userId,
    statistics: {
      totalRegistrations: registrations.length,
      upcomingEvents: registrations.filter(reg => {
        const event = events[reg.eventId];
        return event && new Date(event.eventDate) > new Date();
      }).length,
      pastEvents: registrations.filter(reg => {
        const event = events[reg.eventId];
        return event && new Date(event.eventDate) <= new Date();
      }).length
    },
    registrations: registrations.map(reg => {
      const event = events[reg.eventId] || {};
      return {
        registrationId: reg.id,
        eventId: reg.eventId,
        eventName: event.name || 'Unknown Event',
        eventDate: event.eventDate || 'Unknown Date',
        registrationDate: reg.createdAt,
        status: reg.checkedIn ? 'Attended' : 'Registered'
      };
    }),
    generatedAt: new Date().toISOString()
  };
  
  // In a real implementation, you would store the report in S3 or DynamoDB
  console.log('Generated report:', JSON.stringify(report, null, 2));
  
  return report;
}

// Start the server
app.listen(port, () => {
  console.log(`Reporting service listening at http://localhost:${port}`);
});