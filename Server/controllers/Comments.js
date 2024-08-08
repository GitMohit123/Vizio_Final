import {
  changeProgress,
  changeVisibility,
  createComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "../database/dynamoOperations.js";

export const getComments = async (req, res, next) => {
  const { userId, videoName } = req.body;
  console.log(userId, videoName);

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
  const { text, userId, userName, videoName, reply_id, videoTime, drawings } = req.body;
  const timestamp = Date.now();
  console.log("Drawing draw it ",drawings);
  if(drawings.length>0){
    try {
      const cleanedDrawing = drawings.replace(/^"|"$/g, '');
      console.log("hola",cleanedDrawing);
      const existingComments = await fetchComments(userId, videoName);
      const commentCount = existingComments.length;
      const commentId = commentCount + 1;
  
      const comment = {
        comment_id: commentId.toString(),
        video_id: videoName,
        reply_id: reply_id ? reply_id.toString() : null,
        territory_id: userName,
        timestamp: timestamp.toString(),
        visibility: false,
        comment: text,
        knowledge_id: userId,
        videoTime: videoTime.toString(),
        drawings: cleanedDrawing, 
        progress: false,
      };
      console.log("hola 60",cleanedDrawing);
      await createComment(comment);
  
      return res.status(201).json({
        success: true,
        message: "Comment and drawings created successfully",
        
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }else{
    try {
      const cleanedDrawing = "";
      console.log("hola",cleanedDrawing);
      const existingComments = await fetchComments(userId, videoName);
      const commentCount = existingComments.length;
      const commentId = commentCount + 1;
  
      const comment = {
        comment_id: commentId.toString(),
        video_id: videoName,
        reply_id: reply_id ? reply_id.toString() : null,
        territory_id: userName,
        timestamp: timestamp.toString(),
        visibility: false,
        comment: text,
        knowledge_id: userId,
        videoTime: videoTime.toString(),
        drawings: cleanedDrawing, 
        progress: false,
      };
      console.log("hola 60",cleanedDrawing);
      await createComment(comment);
  
      return res.status(201).json({
        success: true,
        message: "Comment and drawings created successfully",
        
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
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

export const editComment = async (req, res, next) => {
  const { userId, commentId, newMessage } = req.body;

  try {
    await updateComment(userId, commentId, newMessage);

    return res.status(201).json({
      success: true,
      message: "comment updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  const { userId, commentId, visibility } = req.body;

  try {
    await changeVisibility(userId, commentId, visibility);

    return res.status(201).json({
      success: true,
      message: "Visibility updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  const { userId, commentId, progress } = req.body;

  try {
    await changeProgress(userId, commentId, progress);

    return res.status(201).json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
