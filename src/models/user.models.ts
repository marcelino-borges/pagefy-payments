import { Schema, model } from "mongoose";

export interface IUser {
  _id?: string;
  authId?: string;
  paymentId?: string;
  profileImageUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  agreePrivacy: boolean;
  receiveCommunications: boolean;
  plan: PlansTypes;
}

export enum PlansTypes {
  FREE = 0,
  VIP = 1,
  PLATINUM = 2,
}

const authSchema = new Schema<IUser>(
  {
    authId: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    profileImageUrl: { type: String },
    agreePrivacy: { type: Boolean, required: true },
    receiveCommunications: { type: Boolean, required: true },
    plan: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("Users", authSchema);
