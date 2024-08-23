import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";
import { v4 as uuidv4 } from "uuid";

export const addProjectOperation = async (project) => {
    const params = {
      TableName: "Projects",
      Item: {
        ProjectId: { S: uuidv4() }, // Partition Key
        TeamId: { S: project.TeamId }, // Sort Key
        OwnerId: { S: project.OwnerId },
        OwnerName:{S: project.OwnerName}, // Owner's ID
        ProjectName: { S: project.ProjectName }, // Project's name
        CreatedAt: { S: new Date().toISOString() }, // Creation timestamp
        UpdatedAt: { S: new Date().toISOString() }, // Last update timestamp
        Progress: { S: project.Progress.toString() }, // Project progress as a number
      },
    };
  
    try {
      const command = new PutItemCommand(params);
      await dynamoDBClient.send(command);
    } catch (error) {
      console.error("Error inserting project:", error);
      throw error;
    }
  };