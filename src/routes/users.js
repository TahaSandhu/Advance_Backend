import { Router } from "express";
import { registerUser } from "../controllers/userController.js";

const router = Router();

router.post("/registration", registerUser);

export default router;
