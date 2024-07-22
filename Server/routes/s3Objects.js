import { Router } from "express";
import {
  listTeams,
  createTeam,
  listRoot,
  deleteVideo,
  deleteVideoFolder,
  renameFolderFile,
  downloadFolderFile,
  generationUploadUrl,
  updateProgress,
  createFolder,
  copyObject,
  updateVideoMetadata,
  updateVideoMetadataFolder,
  deleteTeam,
  renameTeam,
} from "../controllers/s3Objects.js";

const s3router = Router();
s3router.get("/listTeams", listTeams);
s3router.post("/createTeam", createTeam);
s3router.get("/fetchTeamsData", listRoot);
s3router.delete("/delete", deleteVideo);
s3router.post("/deletefolder", deleteVideoFolder);
s3router.post("/rename", renameFolderFile);
s3router.post("/download", downloadFolderFile);
s3router.post("/updateprogress", updateProgress);
s3router.post("/generateUploadUrl", generationUploadUrl);
s3router.post("/createFolder", createFolder);
s3router.post("/copyObject", copyObject);
s3router.post("/updateVideoMetadata", updateVideoMetadata);
s3router.post("/updateVideoMetadataFolder", updateVideoMetadataFolder);
s3router.post("/deleteteam", deleteTeam);
s3router.post("/renameteam", renameTeam);

export default s3router;
