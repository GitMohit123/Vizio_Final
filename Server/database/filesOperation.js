import {
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";
import { v4 as uuidv4 } from "uuid";
import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";

export const addItemOperation = async (item) => {
  const pathSegments = item?.FilePath.split("/").filter((segment) => segment);
  let parentId = "root";
  let currentParentId = parentId;
  const transactItems = [];

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const isMp4 = segment.endsWith(".mp4");
    const itemType = isMp4 ? "File" : "Folder";
    const itemId = uuidv4();

    const params = {
      TableName: "FilesAndFolders",
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
        SignedUrl: { S: item.SignedUrl || "" },
      },
    };

    transactItems.push({
      Put: params,
    });

    if (itemType === "Folder") {
      currentParentId = itemId;
    }
  }

  try {
    const command = new TransactWriteItemsCommand({
      TransactItems: transactItems,
    });
    await dynamoDBClient.send(command);
    console.log(`Items added successfully.`);
  } catch (error) {
    console.error(`Error adding items:`, error.message);
    throw error;
  }
};

// export const addItemOperation = async (item) => {
//   const pathSegments = item?.FilePath.split("/").filter((segment) => segment); // Split path into segments
//   let parentId = "root";
//   let currentParentId = parentId;

//   for (let i = 0; i < pathSegments.length; i++) {
//     const segment = pathSegments[i];
//     const isMp4 = segment.endsWith(".mp4");
//     const itemType = isMp4 ? "File" : "Folder";
//     const itemId = uuidv4();

//     const params = {
//       TableName: "FilesAndFolders", // Specify your table name here
//       Item: {
//         ProjectId: { S: item.ProjectId }, // Partition Key
//         ItemId: { S: itemId }, // Unique ID for the item
//         ParentId: { S: currentParentId }, // Parent ID
//         ItemType: { S: itemType }, // Type (file or folder)
//         Name: { S: segment }, // Name of the item
//         Size: { N: item.Size ? item.Size.toString() : "0" }, // Size of the item (in bytes)
//         CreatedAt: { S: new Date().toISOString() }, // Creation timestamp
//         UpdatedAt: { S: new Date().toISOString() }, // Last update timestamp
//         Progress: { S: item.Progress || "" }, // Progress (optional)
//         ...(isMp4 && { SignedUrl: { S: item.SignedUrl } }), // Signed URL if it's a file
//       },
//     };
//     try {
//       const command = new PutItemCommand(params);
//       await dynamoDBClient.send(command);
//       console.log(
//         `Item ${segment} added successfully with ParentId: ${currentParentId}`
//       );

//       // Update parentId only if the item is a folder
//       if (itemType === "Folder") {
//         currentParentId = itemId; // Set current folder's ID as the next ParentId
//       }
//     } catch (error) {
//       console.error(`Error adding item ${segment}:`, error);
//       throw error;
//     }
//   }
// };
