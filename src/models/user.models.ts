export interface IUser {
  _id: string;
  authId: string;
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
