import UserDB from "../models/user.models";
import { IUser } from "./../models/user.models";

// TODO:
// Substituir services por chamadas a outra API

export const getUserByEmail = async (email: string) => {
  const found = await UserDB.findOne({ email }).lean();

  if (!found) {
    return null;
  }

  return found;
};

export const getUserById = async (userId: string) => {
  const found = await UserDB.findOne({ _id: userId }).lean();

  if (!found) {
    return null;
  }

  return found;
};

export const getUserByAuthId = async (authId: string) => {
  const found = await UserDB.findOne({ authId }).lean();

  if (!found) {
    return null;
  }

  return found;
};

export const updateUser = async (user: IUser) => {
  let existingUser = await UserDB.findOne({ _id: user._id });

  if (!existingUser) {
    return null;
  }

  const userUpdated = await UserDB.findOneAndUpdate(
    { _id: user._id },
    { ...user, email: existingUser.email },
    {
      new: true,
    }
  );

  if (!userUpdated) {
    return null;
  }

  return userUpdated;
};
