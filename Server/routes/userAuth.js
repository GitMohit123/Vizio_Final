import { Router } from "express";
import { jwtVerification } from "../controllers/userAuth.js";

const router = Router();
router.get("/jwtVerification",jwtVerification);

export default router