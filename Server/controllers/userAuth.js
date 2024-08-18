import { addUser, getUserById, getUserDetails, updateLastLoginAt } from "../database/userOperations.js";
import admin from "../index.js"
export const jwtVerification = async(req,res)=>{
    if (!req.headers.authorization) {
        return res.status(500).send({ msg: "Token Not Found" });
      }
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decodedValue = await admin.auth().verifyIdToken(token);
        if (!decodedValue) {
          res.status(500).json({ success: false, msg: "Unauthorized access" });
        }
        console.log("Verification approved")
        res.status(200).json(decodedValue);
      } catch (err) {
        console.log(err);
        res.send({ success: false, msg: `Error in extracting the token : ${err}` });
      }
}

export const addUserDetails = async (req, res, next) => {
  const { userId, email, name } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await getUserById(userId);
    const currentTime = new Date().toISOString();

    if (existingUser) {
      // If user exists, update the LastLoginAt field
      await updateLastLoginAt(userId, currentTime);
      return res.send({
        success: true,
        message: "User login time updated successfully",
      });
    } else {
      // If user does not exist, create a new user
      const user = {
        userId: userId,
        email: email,
        name: name,
        createdAt: currentTime,
        lastLoginAt: currentTime,
      };
      await addUser(user);
      return res.send({
        success: true,
        message: "User created successfully",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
      error: err.message,
    });
  }
};

export const fetchUserDetails = async(req,res,next)=>{
  const { userId } = req.params;

  try {
    const userDetails = await getUserDetails(userId);

    if (!userDetails) {
      return res.send({
        success: false,
        message: `Not found`,
      });
    }

    return res.send({
      success: true,
      data: userDetails,
      message:"User found"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching user details",
      error: err.message,
    });
  }
}