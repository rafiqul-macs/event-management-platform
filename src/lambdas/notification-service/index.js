const AWS = require('aws-sdk');
const { processNotification } = require('./notifications');

// Main handler function
exports.handler = async (event) => {
  console.log('Notification Service received event:', JSON.stringify(event));
  
  try {
    // Process EventBridge events
    if (event.source && event.source === 'event-management-platform') {
      const { 'detail-type': detailType, detail } = event;
      
      // Process based on event type
      await processNotification(detailType, detail);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Notification processed successfully' })
      };
    }
    
    // If not from EventBridge
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid event source' })
    };
    
  } catch (error) {
    console.error('Error processing notification:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};