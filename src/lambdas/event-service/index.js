const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { getEvent, listEvents, createEvent, updateEvent, deleteEvent } = require('./events');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const eventBridge = new AWS.EventBridge();

// Environment variables
const EVENTS_TABLE = process.env.EVENTS_TABLE;
const REGISTRATIONS_TABLE = process.env.REGISTRATIONS_TABLE;
const ASSETS_BUCKET = process.env.ASSETS_BUCKET;
const ENVIRONMENT = process.env.ENVIRONMENT;

// Main handler function
exports.handler = async (event) => {
  console.log('Event Service received event:', JSON.stringify(event));
  
  try {
    // API Gateway proxy integration
    if (event.httpMethod) {
      const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
      
      // Determine which operation to perform based on HTTP method and path
      if (httpMethod === 'GET' && path === '/events') {
        // List events with optional filters
        const events = await listEvents(dynamodb, EVENTS_TABLE, queryStringParameters);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(events)
        };
      } 
      else if (httpMethod === 'GET' && path.match(/^\/events\/[a-zA-Z0-9-]+$/)) {
        // Get single event by ID
        const eventId = pathParameters.id;
        const eventData = await getEvent(dynamodb, EVENTS_TABLE, eventId);
        
        if (!eventData) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Event not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(eventData)
        };
      } 
      else if (httpMethod === 'POST' && path === '/events') {
        // Create new event
        const eventData = JSON.parse(body);
        const createdEvent = await createEvent(dynamodb, eventBridge, EVENTS_TABLE, eventData);
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(createdEvent)
        };
      } 
      else if (httpMethod === 'PUT' && path.match(/^\/events\/[a-zA-Z0-9-]+$/)) {
        // Update existing event
        const eventId = pathParameters.id;
        const eventData = JSON.parse(body);
        const updatedEvent = await updateEvent(dynamodb, eventBridge, EVENTS_TABLE, eventId, eventData);
        
        if (!updatedEvent) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Event not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(updatedEvent)
        };
      } 
      else if (httpMethod === 'DELETE' && path.match(/^\/events\/[a-zA-Z0-9-]+$/)) {
        // Delete event
        const eventId = pathParameters.id;
        const result = await deleteEvent(dynamodb, eventBridge, EVENTS_TABLE, eventId);
        
        if (!result) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Event not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Event deleted successfully' })
        };
      }
      
      // If method/path not matched
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Invalid request' })
      };
    }
    
    // Direct invocation (not through API Gateway)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Function must be invoked via API Gateway' })
    };
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};