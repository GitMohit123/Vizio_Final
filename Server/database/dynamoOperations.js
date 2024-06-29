import { DeleteItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
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
          videoTime:item.videoTime ? item.videoTime.S : null
        };
      });
  
      console.log("comments", comments);
  
      return comments;
    } catch (error) {
      throw error;
    }
  };

export const createComment = async (comment) => {
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
        videoTime:{S:comment.videoTime}
      },
    };
  
  
    try {
      const command = new PutItemCommand(params);
      await dynamoDBClient.send(command);
      console.log("Comment created successfully");
    } catch (error) {
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