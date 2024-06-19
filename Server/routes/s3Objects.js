import { Router } from "express";
import { listTeams,createTeam, listRoot } from "../controllers/s3Objects.js";

const s3router = Router();
s3router.get("/listTeams",listTeams);
s3router.post("/createTeam",createTeam);
s3router.get("/fetchTeamsData",listRoot);

export default s3router