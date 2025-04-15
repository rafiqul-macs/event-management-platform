const { v4: uuidv4 } = require('uuid');

/**
 * Get an event by ID
 */
async function getEvent(dynamodb, tableName, eventId) {
  const params = {
    TableName: tableName,
    Key: { id: eventId }
  };
  
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

/**
 * List events with optional filters
 */
async function listEvents(dynamodb, tableName, queryParams = {}) {
  let params = {
    TableName: tableName
  };
  
  // Add filters if provided
  if (queryParams.organizerId) {
    params = {
      TableName: tableName,
      IndexName: 'OrganizerIndex',
      KeyConditionExpression: 'organizerId = :organizerId',
      ExpressionAttributeValues: {
        ':organizerId': queryParams.organizerId
      }
    };
    
    // Add date range filter if provided
    if (queryParams.fromDate && queryParams.toDate) {
      params.KeyConditionExpression += ' AND eventDate BETWEEN :fromDate AND :toDate';
      params.ExpressionAttributeValues[':fromDate'] = queryParams.fromDate;
      params.ExpressionAttributeValues[':toDate'] = queryParams.toDate;
    }
  }
  
  const result = await dynamodb.query(params).promise();
  return result.Items || [];
}

/**
 * Create a new event
 */
async function createEvent(dynamodb, eventBridge, tableName, eventData) {
  // Generate a unique ID for the event
  const eventId = uuidv4();
  
  // Add metadata
  const timestamp = new Date().toISOString();
  const event = {
    id: eventId,
    ...eventData,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Store in DynamoDB
  const params = {
    TableName: tableName,
    Item: event
  };
  
  await dynamodb.put(params).promise();
  
  // Publish event to EventBridge
  await eventBridge.putEvents({
    Entries: [
      {
        Source: 'event-management-platform',
        DetailType: 'EventCreated',
        Detail: JSON.stringify(event),
        EventBusName: `event-management-bus-${process.env.ENVIRONMENT}`
      }
    ]
  }).promise();
  
  return event;
}

/**
 * Update an existing event
 */
async function updateEvent(dynamodb, eventBridge, tableName, eventId, eventData) {
  // Verify event exists
  const existingEvent = await getEvent(dynamodb, tableName, eventId);
  if (!existingEvent) {
    return null;
  }
  
  // Prevent overriding of system fields
  delete eventData.id;
  delete eventData.createdAt;
  
  // Update metadata
  const timestamp = new Date().toISOString();
  const updatedEvent = {
    ...existingEvent,
    ...eventData,
    updatedAt: timestamp
  };
  
  // Update in DynamoDB
  const params = {
    TableName: tableName,
    Item: updatedEvent
  };
  
  await dynamodb.put(params).promise();
  
  // Publish event to EventBridge
  await eventBridge.putEvents({
    Entries: [
      {
        Source: 'event-management-platform',
        DetailType: 'EventUpdated',
        Detail: JSON.stringify(updatedEvent),
        EventBusName: `event-management-bus-${process.env.ENVIRONMENT}`
      }
    ]
  }).promise();
  
  return updatedEvent;
}

/**
 * Delete an event
 */
async function deleteEvent(dynamodb, eventBridge, tableName, eventId) {
  // Verify event exists
  const existingEvent = await getEvent(dynamodb, tableName, eventId);
  if (!existingEvent) {
    return null;
  }
  
  // Delete from DynamoDB
  const params = {
    TableName: tableName,
    Key: { id: eventId }
  };
  
  await dynamodb.delete(params).promise();
  
  // Publish event to EventBridge
  await eventBridge.putEvents({
    Entries: [
      {
        Source: 'event-management-platform',
        DetailType: 'EventCancelled',
        Detail: JSON.stringify(existingEvent),
        EventBusName: `event-management-bus-${process.env.ENVIRONMENT}`
      }
    ]
  }).promise();
  
  return true;
}

module.exports = {
  getEvent,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent
};