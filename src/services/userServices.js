import {
  createUser as createUserRepo,
  getUsers,
  findUserByEmailOrUsername,
  findById,
  Logout,
  updateUser,
} from "../repositories/userRepository.js";
import { generateAccessToken, verifyRefreshToken } from "../middlewares/tokenMiddleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/apiErrors.js";

export const getUserService = async () => {
  const users = await getUsers();
  return users;
};

const generatingAccessAndRefreshToken = async(userId) => {
  try {
    const user = await findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    // Save the refresh token to the user document reason is required field give error so that why use validateBeforeSave: false
    await user.save({validateBeforeSave: false}); 
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
}

export const createUser = async (userData) => {
  const { fullName, email, username, password, avatar, coverImage } = userData;

  if (
    [fullName, email, username, password, avatar].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await findUserByEmailOrUsername(email, username);
  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "User with this email already exists");
    }
    if (existingUser.username === username) {
      throw new ApiError(409, "Username is already taken");
    }
  }

  const avatarImageUploaded = await uploadOnCloudinary(avatar);
  const coverImageUploaded = await uploadOnCloudinary(coverImage);

  if (!avatarImageUploaded) {
    throw new ApiError(400, "avatar required");
  }

  const createdUser = await createUserRepo({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatarImageUploaded.url,
    coverImage: coverImageUploaded?.url || "",
  });

  const findUser = await findById(createdUser._id);

  if (!findUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return findUser;
};

export const loginService = async (userData) => {
  const { email, username, password } = userData;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Password register");
  }

  const existingUser = await findUserByEmailOrUsername(email, username);

  if (!existingUser) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await existingUser.isPasswordCorrect(password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
 const { accessToken, refreshToken } = await generatingAccessAndRefreshToken(existingUser._id)
  const options = {
    httpOnly: true,
    secure: true,
  };
  return {
    user: existingUser,
    accessToken,
    refreshToken,
    options,
  };
};

export const LogoutUserService = async (userId) => {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
   const options = {
    httpOnly: true,
    secure: true,
  };
  const result = await Logout(user);

  return {  user: result , options };
};

export const RefreshAccessTokenService = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await findUserById(decoded.userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(403, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return { newAccessToken, user, options };
};

export const ChangePasswordService = async (userId, newPassword,oldPassword) => {
  const user = await findById(userId);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (isPasswordCorrect !== true) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save(
    { validateBeforeSave: true }
  );

  return user;
};

export const updateUserAccountDetailsService = async (userId, updateData) => {
  if (!(updateData.fullName && updateData.email && updateData.username)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingUser = await findUserByEmailOrUsername(updateData.email, updateData.username, userId);
  if (existingUser) {
    throw new ApiError(409, "Email or username already in use.");
  }

  const updatedUser = await updateUser(userId, {
    fullName: updateData.fullName,
    email: updateData.email,
    username: updateData.username,
  });

  return updatedUser;
};

export const UpdateUserAvatarService = async (userId, avatar) => {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const avatarImageUploaded = await uploadOnCloudinary(avatar);
  if (!avatarImageUploaded) {
    throw new ApiError(400, "Avatar file is required");
  }

  const updatedUser = await updateUserAvatar(userId, avatarImageUploaded.url);

  return updatedUser;
};


export const UpdateUserBackgroundService = async (userId, backgroundImage) => {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const uploadedBackgroundImage = await uploadOnCloudinary(backgroundImage);
  if (!uploadedBackgroundImage) {
    throw new ApiError(400, "Background image is required");
  }

  const updatedUser = await updateUserBackground(userId, uploadedBackgroundImage.url);

  return updatedUser;
};
