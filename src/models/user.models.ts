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
  onboardings: {
    userPages: boolean;
    pageEditor: {
      general: boolean;
      createDialog: boolean;
      createButton: boolean;
    };
  };
}

export enum PlansTypes {
  FREE = 0,
  VIP = 1,
  PLATINUM = 2,
}
