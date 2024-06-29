import { createComment, deleteComment, fetchComments } from "../database/dynamoOperations.js";

export const getComments = async (req, res, next) => {
    const { userId, videoName } = req.body;
    console.log(userId,videoName)
  
    try {
      const data = await fetchComments(userId, videoName);
  
      console.log("Inside api");
  
      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      console.log(error);
  
      next(error);
    }
  };

  export const generateComment = async (req, res, next) => {
    const { text, userId, userName, videoName, reply_id,videoTime } =
      req.body;
      const timestamp = Date.now()
  
    try {
      const existingComments = await fetchComments(userId, videoName);
      const commentCount = existingComments.length;
      const commentId = commentCount + 1;
  
      const comment = {
        comment_id: commentId.toString(),
        video_id: videoName,
        reply_id: null || reply_id.toString(),
        territory_id: userName,
        timestamp: timestamp.toString(),
        visibility: false,
        comment: text,
        knowledge_id: userId,
        videoTime:videoTime.toString()
      };
      await createComment(comment);
  
      return res.status(201).json({
        success: true,
        message: "Comment created successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

 export const delComment = async (req, res, next) => {
    const { userId, commentId } = req.body;
  
    try {
      await deleteComment(userId, commentId);
  
      return res.status(201).json({
        success: true,
        message: "comment deleted successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };