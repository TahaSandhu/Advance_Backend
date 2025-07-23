import {
  createUser as createUserRepo,
  getUsers,
  findUserByEmailOrUsername,
  findById,
  Logout,
} from "../repositories/userRepository.js";
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

export const loginService = async (userData) => {
  const { email, username, password } = userData;
console.log("s1",{ email, username, password });
  if (!username || !email) {
    throw new ApiError(400, "Username or Password register");
  }

  const existingUser = await findUserByEmailOrUsername(email, username);
  console.log("p0", { existingUser });

  if (!existingUser) {
    throw new ApiError(404, "User does not exist");
  }
  console.log("s4", { existingUser });

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