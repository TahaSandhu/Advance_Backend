import {
  createUser as createUserRepo,
  getUsers,
  findUserByEmailOrUsername,
  findById,
} from "../repositories/userRepository.js";
import ApiError from "../utils/apiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getUserService = async () => {
  const users = await getUsers();
  return users;
};

export const createUser = asyncHandler(async (userData) => {
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

  if (!avatar) {
    throw new ApiError(400, "avatar required");
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

  const createUser = await findById(createdUser._id);

  if(!createUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }
  
  return createdUser;
});
