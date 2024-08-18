import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";

const userTable = "User";

export const addUser = async (user) => {
  // console.log("Inserting user:", JSON.stringify(req.body));

  const params = {
    TableName: userTable,
    Item: {
      UserId: { S: user.userId }, // Partition Key
      Email: { S: user.email }, // User's email
      Name: { S: user.name }, // User's name
      CreatedAt: { S: user.createdAt }, // Creation timestamp
      LastLoginAt: { S: user.lastLoginAt }, // Last login timestamp
    },
  };

  try {
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("User inserted successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  const params = {
    TableName: userTable,
    KeyConditionExpression: "UserId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await dynamoDBClient.send(command);
    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateLastLoginAt = async (userId, lastLoginAt) => {
  const params = {
    TableName: userTable,
    Key: {
      UserId: { S: userId }, // Partition Key
    },
    UpdateExpression: "SET LastLoginAt = :lastLoginAt",
    ExpressionAttributeValues: {
      ":lastLoginAt": { S: lastLoginAt },
    },
  };

  try {
    const command = new UpdateItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("User LastLoginAt updated successfully");
  } catch (error) {
    console.error("Error updating LastLoginAt:", error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
    const params = {
      TableName: userTable,
      Key: {
        UserId: { S: userId }, // Partition Key
      },
    };
  
    try {
      const command = new GetItemCommand(params);
      const result = await dynamoDBClient.send(command);
  
      if (!result.Item) {
        console.log(`User with userId ${userId} not found`);
        return null; // User not found
      }
  
      // Return the user details, mapping DynamoDB format to plain object
      // console.log(result.Item)
      const userDetails = {
        userId: result.Item.UserId.S,
        email: result.Item.Email.S,
        name: result.Item.Name.S,
        createdAt: result.Item.CreatedAt.S,
        lastLoginAt: result.Item.LastLoginAt.S,
      };
      return userDetails;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };