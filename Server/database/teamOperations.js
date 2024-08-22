import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";
import { v4 as uuidv4 } from "uuid";

export const addTeam = async (team) => {
  const params = {
    TableName: "Teams",
    Item: {
      TeamId: { S: uuidv4() }, // Partition Key
      OwnerId: { S: team.OwnerId }, // Sort Key
      TeamName: { S: team.TeamName }, // Team's name
      OwnerName: { S: team.OwnerName }, // Owner's name
      CreatedAt: { S: new Date().toISOString() }, // Creation timestamp
    },
  };
  try {
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Team inserted successfully in the table");
  } catch (error) {
    console.error("Error inserting team:", error);
    throw error;
  }
};
export const getTeamsByOwnerID = async (ownerId) => {
  const params = {
    TableName: "Teams",
    FilterExpression: "OwnerId = :ownerId",
    ExpressionAttributeValues: {
      ":ownerId": { S: ownerId },
    },
  };

  try {
    const command = new ScanCommand(params);
    const data = await dynamoDBClient.send(command);

    // Transform the data to the desired format
    const formattedItems = data.Items.map((item) => ({
      OwnerName: item.OwnerName.S,
      TeamId: item.TeamId.S,
      TeamName: item.TeamName.S,
      OwnerId: item.OwnerId.S,
      CreatedAt: item.CreatedAt.S,
    }));
    return formattedItems; // Returns an array of the formatted items
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const deleteTeamOperation = async (teamId, ownerId) => {
  const params = {
    TableName: "Teams",
    Key: {
      TeamId: { S: teamId },
      OwnerId: { S: ownerId },
    },
  };

  try {
    const command = new DeleteItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Team deleted successfully");
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};

export const renameTeamDB = async (teamId, newTeamName,ownerId) => {
  const params = {
    TableName: "Teams",
    Key: {
      TeamId: { S: teamId },
      OwnerId: { S: ownerId } 
    },
    UpdateExpression: "SET TeamName = :newTeamName",
    ExpressionAttributeValues: {
      ":newTeamName": { S: newTeamName }, // New team name value
    },
    ReturnValues: "UPDATED_NEW", // Return the updated attributes
  };

  try {
    const command = new UpdateItemCommand(params);
    const response = await dynamoDBClient.send(command);
    console.log("Team name updated successfully:", response);
  } catch (error) {
    console.error("Error updating team name:", error);
    throw error;
  }
};

