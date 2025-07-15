import { Router } from "express";
import { registerUser, get } from "../controllers/userController.js";
import { upload } from "../middlewares/uploadImageMiddle.js";

const router = Router();

router.get("/users", get);

router.post(
  "/registration",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

export default router;
