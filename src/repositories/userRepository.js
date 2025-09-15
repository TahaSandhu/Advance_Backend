import { userModel } from "../model/userModel.js";

export const getUsers = async () => {
  return userModel.find().exec();
};

export const findById = async (id) => {
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
  return userModel
    .findByIdAndUpdate(id, { $set: user }, { new: true })
    .select("-password")
    .exec();
};

export const updateUserAvatar = async (id, avatarUrl) => {
  return userModel
    .findByIdAndUpdate(id, { $set: { avatar: avatarUrl } }, { new: true })
    .select("-password")
    .exec();
};

export const updateUserBackground = async (id, backgroundUrl) => {
  return userModel
    .findByIdAndUpdate(
      id,
      { $set: { background: backgroundUrl } },
      { new: true }
    )
    .select("-password")
    .exec();
};

export const findUserByEmailOrUsername = async (email, username) => {
  const result = await userModel
    .findOne({
      $or: [{ email }, { username }],
    })
    .select("+password")
    .exec();
  return result;
};

export const Logout = async (user) => {
  const { email, username } = user;
  return userModel
    .findOneAndUpdate(
      { $or: [{ email }, { username }] },
      { $set: { refreshToken: null } },
      { new: true }
    )
    .exec();
};

// Repository function to get channel profile with aggregation
export const getUserChannelProfileRepo = async (username, currentUserId) => {
  return await userModel.aggregate([
    // Match the channel by username
    { $match: { username: username?.toLowerCase() } },

    // Lookup: get subscribers
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    // Lookup: get channels this user subscribed to
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "subscribers",
        as: "subscribedTo",
      },
    },

    // Add extra fields
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        chanelSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [currentUserId, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // Select required fields only
    {
      $project: {
        fullName: 1,
        username: 1,
        _id: 1,
        subscribersCount: 1,
        chanelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
};
