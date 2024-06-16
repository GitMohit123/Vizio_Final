import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3config.js";

const prefix = "users/";

export const listTeams = async (req, res, next) => {
  const { user_id } = req.query;
  // console.log(user_id)
  try {
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + `${user_id}/`,
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));

    if (data.KeyCount === 0) {
      // No teams found for the user
      return res.status(204).json({ message: "No content found" });
    }
    const teamNames = data.Contents.map((obj) => {
      const keyParts = obj.Key.split("/");
      // console.log(keyParts)
      if (keyParts.length === 4) {
        return keyParts[keyParts.length - 2];
      }
    });
    const filteredTeamNames = teamNames.filter(
      (teamName) => teamName !== null && teamName !== undefined
    );
    const uniqueTeamNames = [...new Set(filteredTeamNames)];

    return res.status(200).json(uniqueTeamNames); // Send OK (200) with the list of teams
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" }); // Send Internal Server Error (500) with a generic message
  }
};

export const createTeam = async (req, res, next) => {
    const { teamName, user_id } = req.body;
    if (!teamName || !user_id) {
      return res.status(400).json({ message: "Missing required fields: teamName and user_id" });
    }
    try {
      const params = {
        Bucket: "vidzspace",
        Key: prefix + `${user_id}/${teamName}/`,
        Body: "",
      };
  
      const data = await s3Client.send(new PutObjectCommand(params));
      return res.status(200).json({ message: "Team created successfully" });
    } catch (err) {
      console.error("Error creating team folder:", err);
      // Handle specific errors (optional)
      if (err.code === "AccessDenied") {
        return res.status(403).json({ message: "Insufficient permissions to create team folder" });
      } else if (err.code === "BucketNotFound") {
        return res.status(404).json({ message: "Bucket not found" });
      } else {
        // Generic error handling (improve based on specific needs)
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };