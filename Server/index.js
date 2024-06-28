import cookieParser from "cookie-parser";
// const serviceAccountKey = require("./serviceAccountKey.json");
import express from "express"
import cors from "cors";
import admin from "firebase-admin";
import { serviceAccountKey } from "./firebaseServiceAccountKey.js";
import userRouter from "./routes/userAuth.js"
import s3router from "./routes/s3Objects.js";
admin.initializeApp({
    credential:admin.credential.cert(serviceAccountKey)
});
export default admin;

// Initialize the app
export const app = express();
app.use(express.json());
app.use(cookieParser());

//Enable cors origin
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Api testing end points
app.get("/", (req, res) => {
  res.send("express working");
});


// const commentRouter = require("./routes/comment");

app.use("/vidzspaceApi/users/auth", userRouter);
app.use("/vidzspaceApi/users/s3",s3router);
// // app.use("/server/api", userRouter)
// app.use("/api/commentSection", commentRouter);

app.get("/", (req,res,next) => {
  res.send("anurag");
});
app.listen(5001, (req, res) => {
    console.log(`Server initialized at 6000`);
  });

