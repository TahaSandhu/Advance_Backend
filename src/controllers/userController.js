import { createUser } from "../services/userServices.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coveImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const userData = {
    fullName,
    email,
    username,
    password,
    avatar: avatarLocalPath,
    coverImage: coverImageLocalPath,
  };

  const user = await createUser(userData);

  // Optionally: Upload to cloud storage here if needed
  // const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  // user.avatar = avatarUrl;
  // await user.save();

  res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});
