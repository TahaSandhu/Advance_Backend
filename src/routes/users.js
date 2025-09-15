import { Router } from "express";
import {
  registerUser,
  get,
  LogoutUser,
  loginUser,
  RefreshAccessToken,
  getUserChanelProfile,
} from "../controllers/userController.js";
import { upload } from "../middlewares/uploadImageMiddle.js";
import { VerifyUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/users", get);
router.post("/login", loginUser);
router.post(
  "/registration",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// secure routes
router.post("/logout", VerifyUser, LogoutUser);
router.get("/chanel-profile/:username", VerifyUser, getUserChanelProfile);
router.post("/refresh-token", VerifyUser, RefreshAccessToken);

export default router;
