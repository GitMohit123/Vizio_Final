import { Router } from "express";
import { delComment, editComment, generateComment, getComments, likeComment, updateProgress } from "../controllers/Comments.js";
const commentsrouter = Router();

commentsrouter.post("/fetchComments",getComments);
commentsrouter.post("/createComment",generateComment);
commentsrouter.post('/deleteComment',delComment);
commentsrouter.post("/editComment",editComment);
commentsrouter.post("/likeComment",likeComment);
commentsrouter.post("/updateCommentProgress",updateProgress)
export default commentsrouter;