import { Router } from "express";
import { registerUser, get, LogoutUser, loginUser, RefreshAccessToken } from "../controllers/userController.js";
import { upload } from "../middlewares/uploadImageMiddle.js";
import { JwttokenMiddleware } from "../middlewares/authMiddleware.js";

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
router.post("/logout", JwttokenMiddleware,LogoutUser);
router.post("/refresh-token", JwttokenMiddleware,RefreshAccessToken);

export default router;
