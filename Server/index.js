import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { serviceAccountKey } from "./firebaseServiceAccountKey.js";
import userRouter from "./routes/userAuth.js";
import s3router from "./routes/s3Objects.js";
import commentsrouter from "./routes/comments.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

export default admin;

// Initialize the app
export const app = express();
app.use(express.json());
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: "*", // You can specify specific origins if needed
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  credentials: true,
}));

// Api testing end points
app.get("/", (req, res) => {
  res.send("express working");
});

app.use("/vidzspaceApi/users/auth", userRouter);
app.use("/vidzspaceApi/users/s3", s3router);
app.use("/vidzspaceApi/users/comments", commentsrouter);

app.listen(5001, () => {
  console.log(`Server initialized at 5001`);
});
