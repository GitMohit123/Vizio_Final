import {
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";
import { v4 as uuidv4 } from "uuid";

export const addProjectOperation = async (project) => {
  const params = {
    TableName: "Projects",
    Item: {
      ProjectId: { S: uuidv4() }, // Partition Key
      TeamId: { S: project.TeamId }, // Sort Key
      OwnerId: { S: project.OwnerId },
      OwnerName: { S: project.OwnerName }, // Owner's ID
      ProjectName: { S: project.ProjectName }, // Project's name
      CreatedAt: { S: new Date().toISOString() }, // Creation timestamp
      UpdatedAt: { S: new Date().toISOString() }, // Last update timestamp
      Progress: { S: project.Progress.toString() },
      NestedFiles: {
        L: project.nestedFiles.map((fileObj) => ({
          M: {
            file: { S: fileObj.file },
            signedUrl: { S: fileObj.signedUrl },
          },
        })),
      },
      NestedFolders: {
        L: project.nestedFolders.map((folderObj) => ({
          M: {
            folder: { S: folderObj.folder }
          },
        })),
      },
    },
  };

  console.log(params);
  try {
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);
  } catch (error) {
    console.error("Error inserting project:", error);
    throw error;
  }
};

export const getProjectsByTeamId = async (teamId) => {
  const params = {
    TableName: "Projects",
    FilterExpression: "TeamId = :teamId",
    ExpressionAttributeValues: {
      ":teamId": { S: teamId },
    },
  };

  try {
    const command = new ScanCommand(params);
    const data = await dynamoDBClient.send(command);
    const formattedItems = data.Items.map((item) => ({
      ProjectId: item.ProjectId.S, // Partition Key
      TeamId: item.TeamId.S, // Sort Key
      OwnerId: item.OwnerId.S,
      OwnerName: item.OwnerName.S, // Owner's ID
      ProjectName: item.ProjectName.S, // Project's name
      CreatedAt: item.CreatedAt.S, // Creation timestamp
      UpdatedAt: item.UpdatedAt.S, // Last update timestamp
      Progress: item.Progress.S,
      NestedFiles: item.NestedFiles.L.map((file) => ({
        file: file.M.file.S,
        signedUrl: file.M.signedUrl.S,
      })),
      NestedFolders: item.NestedFolders.L.map((folder) => ({
        folder: folder.M.folder.S,
      })),
    }));
    return formattedItems || [];
  } catch (error) {
    console.error("Error fetching projects by TeamId:", error);
    throw error;
  }
};
