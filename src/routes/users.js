import { Router } from "express";
import { get, registerUser } from "../controllers/userController.js";

const router = Router();

router.get("/users", get);
// router.post("/registration", registerUser);
router.route("/registration").post(
  uploadOnCloudinary.file([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
