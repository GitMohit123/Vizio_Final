import { Router } from "express";
import { delComment, generateComment, getComments } from "../controllers/Comments.js";
const commentsrouter = Router();

commentsrouter.post("/fetchComments",getComments);
commentsrouter.post("/createComment",generateComment);
commentsrouter.post('/deleteComment',delComment);
export default commentsrouter;