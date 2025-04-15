const { v4: uuidv4 } = require('uuid');

/**
 * Get a user by ID
 */
async function getUser(dynamodb, tableName, userId) {
  const params = {
    TableName: tableName,
    Key: { id: userId }
  };
  
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

/**
 * Get a user by email
 */
async function getUserByEmail(dynamodb, tableName, email) {
  const params = {
    TableName: tableName,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };
  
  const result = await dynamodb.query(params).promise();
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

/**
 * List users with optional filters
 */
async function listUsers(dynamodb, tableName, queryParams = {}) {
  let params = {
    TableName: tableName
  };
  
  // Add scan filter if search term provided
  if (queryParams.search) {
    params.FilterExpression = 'contains(firstName, :search) OR contains(lastName, :search) OR contains(email, :search)';
    params.ExpressionAttributeValues = {
      ':search': queryParams.search
    };
  }
  
  const result = await dynamodb.scan(params).promise();
  return result.Items || [];
}

/**
 * Create a new user
 */
async function createUser(dynamodb, tableName, userData) {
  // Check if email already exists
  const existingUser = await getUserByEmail(dynamodb, tableName, userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Generate a unique ID for the user
  const userId = uuidv4();
  
  // Add metadata
  const timestamp = new Date().toISOString();
  const user = {
    id: userId,
    ...userData,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Store in DynamoDB
  const params = {
    TableName: tableName,
    Item: user
  };
  
  await dynamodb.put(params).promise();
  return user;
}

/**
 * Update an existing user
 */
async function updateUser(dynamodb, tableName, userId, userData) {
  // Verify user exists
  const existingUser = await getUser(dynamodb, tableName, userId);
  if (!existingUser) {
    return null;
  }
  
  // If email is being changed, check if the new email is already in use
  if (userData.email && userData.email !== existingUser.email) {
    const userWithNewEmail = await getUserByEmail(dynamodb, tableName, userData.email);
    if (userWithNewEmail && userWithNewEmail.id !== userId) {
      throw new Error('Email already registered');
    }
  }
  
  // Prevent overriding of system fields
  delete userData.id;
  delete userData.createdAt;
  
  // Update metadata
  const timestamp = new Date().toISOString();
  const updatedUser = {
    ...existingUser,
    ...userData,
    updatedAt: timestamp
  };
  
  // Update in DynamoDB
  const params = {
    TableName: tableName,
    Item: updatedUser
  };
  
  await dynamodb.put(params).promise();
  return updatedUser;
}

/**
 * Delete a user
 */
async function deleteUser(dynamodb, tableName, userId) {
  // Verify user exists
  const existingUser = await getUser(dynamodb, tableName, userId);
  if (!existingUser) {
    return null;
  }
  
  // Delete from DynamoDB
  const params = {
    TableName: tableName,
    Key: { id: userId }
  };
  
  await dynamodb.delete(params).promise();
  return true;
}

module.exports = {
  getUser,
  getUserByEmail,
  listUsers,
  createUser,
  updateUser,
  deleteUser
};