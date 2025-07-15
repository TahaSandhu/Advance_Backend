import {
  createUser as createUserRepo,
  getUsers,
  findUserByEmailOrUsername,
  findById,
} from "../repositories/userRepository.js";
import ApiError from "../utils/apiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from "path";

export const getUserService = async () => {
  const users = await getUsers();
  return users;
};

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

  const normalizedAvatarPath = path.resolve(avatar);
  const normalizedCoverImagePath = path.resolve(coverImage);

  const avatarImageUploaded = await uploadOnCloudinary(normalizedAvatarPath);
  const coverImageUploaded = await uploadOnCloudinary(normalizedCoverImagePath);

  console.log("tService", { avatarImageUploaded, coverImageUploaded });

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
