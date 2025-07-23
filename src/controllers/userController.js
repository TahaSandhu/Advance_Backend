import {
  createUser,
  getUserService,
  loginService,
  LogoutUserService,
} from "../services/userServices.js";
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
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path ?? null;

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

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const userData = {
    email,
    username,
    password,
  };

  const user = await loginService(userData);

  res
    .status(200)
    .cookie("refreshToken", user.refreshToken, user.options)
    .cookie("accessToken", user.accessToken, user.options)
    .json(
      new ApiResponse(
        200,
        {
          user: user.user,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export const LogoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await LogoutUserService(userId);
  console.log("T1", { user });
  res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, { user }, "User logged out successfully"));
});
