const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { getUser, listUsers, createUser, updateUser, deleteUser } = require('./users');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const USERS_TABLE = process.env.USERS_TABLE;
const ENVIRONMENT = process.env.ENVIRONMENT;

// Main handler function
exports.handler = async (event) => {
  console.log('User Service received event:', JSON.stringify(event));
  
  try {
    // API Gateway proxy integration
    if (event.httpMethod) {
      const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
      
      // Determine which operation to perform based on HTTP method and path
      if (httpMethod === 'GET' && path === '/users') {
        // List users with optional filters
        const users = await listUsers(dynamodb, USERS_TABLE, queryStringParameters);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(users)
        };
      } 
      else if (httpMethod === 'GET' && path.match(/^\/users\/[a-zA-Z0-9-]+$/)) {
        // Get single user by ID
        const userId = pathParameters.id;
        const userData = await getUser(dynamodb, USERS_TABLE, userId);
        
        if (!userData) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'User not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(userData)
        };
      } 
      else if (httpMethod === 'POST' && path === '/users') {
        // Create new user
        const userData = JSON.parse(body);
        const createdUser = await createUser(dynamodb, USERS_TABLE, userData);
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(createdUser)
        };
      } 
      else if (httpMethod === 'PUT' && path.match(/^\/users\/[a-zA-Z0-9-]+$/)) {
        // Update existing user
        const userId = pathParameters.id;
        const userData = JSON.parse(body);
        const updatedUser = await updateUser(dynamodb, USERS_TABLE, userId, userData);
        
        if (!updatedUser) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'User not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(updatedUser)
        };
      } 
      else if (httpMethod === 'DELETE' && path.match(/^\/users\/[a-zA-Z0-9-]+$/)) {
        // Delete user
        const userId = pathParameters.id;
        const result = await deleteUser(dynamodb, USERS_TABLE, userId);
        
        if (!result) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'User not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'User deleted successfully' })
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