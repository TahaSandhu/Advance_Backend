import mongoose from "mongoose";
import { userModel } from "../model/userModel.js";

export const getUsers = async () => {
  return userModel.find().exec();
};

export const findById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }
  return userModel.findById(id).select("-password -refreshToken");
};

export const createUser = async (user) => {
  const createdUser = new userModel(user);
  return createdUser.save();
};

export const removeUser = async (id) => {
  return userModel.findByIdAndDelete(id).exec();
};

export const updateUser = async (id, user) => {
  return userModel.findByIdAndUpdate(id, user, { new: true }).exec();
};

export const findUserByEmailOrUsername = async (email, username) => {
  return userModel
    .findOne({
      $or: [{ email }, { username }],
    })
    .exec();
};
