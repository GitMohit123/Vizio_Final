import { Router } from "express";
import { addUserDetails, fetchUserDetails, jwtVerification } from "../controllers/userAuth.js";

const router = Router();
router.get("/jwtVerification",jwtVerification);
router.post("/addUser",addUserDetails);
router.get("/fetchUser/:userId",fetchUserDetails);

export default router