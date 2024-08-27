import {
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";
import { v4 as uuidv4 } from "uuid";

export const addItemOperation = async (item) => {
  const pathSegments = item?.FilePath.split("/").filter((segment) => segment);
  let parentId = "root";
  let currentParentId = parentId;
  const batchItems = [];

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const isMp4 = segment.endsWith(".mp4");
    const itemType = isMp4 ? "File" : "Folder";
    const itemId = uuidv4();

    batchItems.push({
      PutRequest: {
        Item: {
          ProjectId: { S: item.ProjectId },
          ItemId: { S: itemId },
          ParentId: { S: currentParentId },
          ItemType: { S: itemType },
          Name: { S: segment },
          Size: { N: item.Size ? item.Size.toString() : "0" },
          CreatedAt: { S: new Date().toISOString() },
          UpdatedAt: { S: new Date().toISOString() },
          Progress: { S: item.Progress || "" },
          ...(isMp4 && { SignedUrl: { S: item.SignedUrl } }),
        },
      },
    });

    if (itemType === "Folder") {
      currentParentId = itemId;
    }
  }

  try {
    for (let i = 0; i < batchItems.length; i += 25) {
      const chunk = batchItems.slice(i, i + 25);
      const params = {
        TransactItems: chunk.map((item) => ({
          Put: {
            TableName: "FilesAndFolders",
            Item: item.PutRequest.Item,
          },
        })),
      };

      const command = new TransactWriteItemsCommand(params);
      const response = await dynamoDBClient.send(command);
      console.log(`Batch ${i/25 + 1} added successfully:`, response);
    }
    console.log("All items added successfully");
  } catch (error) {
    console.error("Error adding items:", error);
    throw error;
  }
};	