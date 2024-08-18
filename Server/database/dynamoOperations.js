import {
  DeleteItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "./dynamoDB.js";

const commentTable = "vizioComments";

export const fetchComments = async (userId, videoName) => {
  console.log("userId", userId, videoName);

  const params = {
    TableName: commentTable,
    KeyConditionExpression:
      "knowledge_id = :userId AND begins_with(video_comment_id, :videoId)",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
      ":videoId": { S: `${videoName}-` },
    },
  };

  try {
    const command = new QueryCommand(params);

    const { Items } = await dynamoDBClient.send(command);
    //console.log("items", Items);

    const comments = Items.map((item) => {
      return {
        knowledge_id: item.knowledge_id ? item.knowledge_id.S : null,
        video_comment_id: item.video_comment_id
          ? item.video_comment_id.S
          : null,
        reply_id: item.reply_id ? item.reply_id.S : null,
        territory_id: item.territory_id ? item.territory_id.S : null,
        timestamp: item.timestamp ? item.timestamp.S : null,
        visibility: item.visibility ? item.visibility.BOOL : null,
        comment: item.comment ? item.comment.S : null,
        videoTime: item.videoTime ? item.videoTime.S : null,
        progress:item.progress? item.progress.BOOL : null,
        drawings:item.drawings? item.drawings.S : null,
      };
    });

    console.log("comments", comments);

    return comments;
  } catch (error) {
    throw error;
  }
};

export const createComment = async (comment) => {
  // console.log("comment.drawing", JSON.stringify(comment.drawings) )
  const params = {
    TableName: commentTable,
    Item: {
      knowledge_id: { S: comment.knowledge_id },
      video_comment_id: { S: `${comment.video_id}-${comment.comment_id}` },
      reply_id: { S: comment.reply_id || "null" },
      territory_id: { S: comment.territory_id }, // Name
      timestamp: { S: comment.timestamp },
      visibility: { BOOL: comment.visibility },
      comment: { S: comment.comment },
      videoTime: { S: comment.videoTime },
      progress: { BOOL: comment.progress },
      drawings: { S: JSON.stringify(comment.drawings) },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Comment and drawings created successfully");
  } catch (error) {
    console.error("Error creating comment and drawings:", error);
    throw error;
  }
};


export const deleteComment = async (userId, commentId) => {
  const params = {
    TableName: commentTable,
    Key: {
      knowledge_id: { S: userId }, // UserID as the partition key
      video_comment_id: { S: `${commentId}` },
    },
  };

  try {
    const command = new DeleteItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Comment deleted successfully");
  } catch (error) {
    throw error;
  }
};

export const updateComment = async (
  userId,
  commentId,
  newMessage
) => {
  console.log("userId", userId, commentId, newMessage);

  const params = {
    TableName: commentTable,

    Key: {
      knowledge_id: { S: userId }, // UserID as the partition key
      video_comment_id: { S: `${commentId}` },
    },

    UpdateExpression: "SET #cmnt = :m",
    ExpressionAttributeNames: {
      "#cmnt": "comment", // Update to the correct attribute name
    },
    ExpressionAttributeValues: {
      ":m": { S: newMessage },
    },
    ConditionExpression:
      "attribute_exists(knowledge_id) AND attribute_exists(video_comment_id)",
  };

  try {
    const command = new UpdateItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Comment updated successfully");
  } catch (error) {
    throw error;
  }
};

export const changeVisibility = async (
  userId,
  commentId,
  visibility
) => {
  console.log("userId", userId, commentId, visibility);

  const params = {
    TableName: commentTable,

    Key: {
      knowledge_id: { S: userId }, // UserID as the partition key
      video_comment_id: { S: `${commentId}` },
    },

    UpdateExpression: "SET #vis = :v",
    ExpressionAttributeNames: {
      "#vis": "visibility", // Update to the correct attribute name
    },
    ExpressionAttributeValues: {
      ":v": { BOOL: visibility }, // Ensure the correct type is used
    },
    ConditionExpression:
      "attribute_exists(knowledge_id) AND attribute_exists(video_comment_id)",
  };

  try {
    const command = new UpdateItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Visibility updated successfully");
  } catch (error) {
    throw error;
  }
};

export const changeProgress = async (
  userId,
  commentId,
  progress
) => {
  console.log("userId", userId, commentId, progress);

  const params = {
    TableName: commentTable,

    Key: {
      knowledge_id: { S: userId }, // UserID as the partition key
      video_comment_id: { S: `${commentId}` },
    },

    UpdateExpression: "SET #pro = :p",
    ExpressionAttributeNames: {
      "#pro": "progress", // Update to the correct attribute name
    },
    ExpressionAttributeValues: {
      ":p": { BOOL: progress }, // Ensure the correct type is used
    },
    ConditionExpression:
      "attribute_exists(knowledge_id) AND attribute_exists(video_comment_id)",
  };

  try {
    const command = new UpdateItemCommand(params);
    await dynamoDBClient.send(command);
    console.log("Progress updated successfully");
  } catch (error) {
    throw error;
  }
};
