import { createUser } from "../services/userServices.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const get = async (req, res) => {
  const user = await getUserService();

  res.status(200).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log("taha 1", { avatarLocalPath, coverImageLocalPath });

  const userData = {
    fullName,
    email,
    username,
    password,
    avatar: avatarLocalPath,
    coverImage: coverImageLocalPath,
  };

  const user = await createUser(userData);

  res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});
