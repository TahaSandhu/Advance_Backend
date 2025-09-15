import {
  createUser,
  loginService,
  getUserService,
  LogoutUserService,
  ChangePasswordService,
  UpdateUserAvatarService,
  UpdateUserBackgroundService,
  updateUserAccountDetailsService,
  getUserChanelProfileService,
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
console.log("userData:", userData);
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }
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
    .json(new ApiResponse(200,{} , "User logged out successfully"));
});

export const RefreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  const { newAccessToken, newRefreshToken, options } = await refreshTokenServices(refreshToken);

  if (!newAccessToken || !newRefreshToken) {
    throw new ApiError(403, "Failed to refresh tokens");
  }

  res
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
});

export const CurrentPasswordChange = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  await ChangePasswordService(userId, newPassword, oldPassword);
  
  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const CurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
})

export const UpdateUserAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { fullName, email, username } = req.body;

  const updatedUser = await updateUserAccountDetailsService(userId, { fullName, email, username });

  res.status(200).json(new ApiResponse(200, updatedUser, "User account details updated successfully"));
})

export const UpdateUserAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const updatedUser = await UpdateUserAvatarService(userId, { avatar: avatarLocalPath });

  res.status(200).json(new ApiResponse(200, updatedUser, "User avatar updated successfully"));
});

export const UpdateUserBackground = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const backgroundLocalPath = req.file?.path;

  if (!backgroundLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const updatedUser = await UpdateUserBackgroundService(userId, { backgroundImage: backgroundLocalPath });

  res.status(200).json(new ApiResponse(200, updatedUser, "User background updated successfully"));
});

export const  getUserChanelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;    
  const user = await getUserChanelProfileService(username);

  res.status(200).json(new ApiResponse(200, user, "User chanel profile fetched successfully"));
});
