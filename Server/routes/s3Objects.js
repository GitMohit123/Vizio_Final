import { Router } from "express";
import { listTeams,createTeam } from "../controllers/s3Objects.js";

const s3router = Router();
s3router.get("/listTeams",listTeams);
s3router.post("/createTeam",createTeam);

export default s3router