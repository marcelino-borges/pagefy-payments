import { model, Schema } from "mongoose";

export interface IUserPage {
  _id?: string;
  userId: string;
  name: string;
  url: string;
  pageImageUrl?: string;
  isPublic: boolean;
  views: number;
  style?: IComponentStyle;
  topComponents?: IUserComponent[];
  middleComponents?: IUserComponent[];
  bottomComponents?: IUserComponent[];
}

export interface IUserComponent {
  _id?: string;
  text?: string;
  url?: string;
  style?: IComponentStyle;
  visible: boolean;
  clicks: number;
  layout: IComponentLayout;
  type: ComponentType;
  mediaUrl?: string;
  iconDetails?: IIconDetails;
  visibleDate?: string;
  launchDate?: string;
  animation?: IComponentAnimation;
}

export interface IComponentAnimation {
  name: string;
  startDelay: number;
  duration: number;
  infinite: boolean;
}

export interface IComponentLayout {
  rows: number;
  columns: number;
}

export interface IIconDetails {
  userFriendlyName: string;
  icon: string;
}

export interface IComponentStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  color?: string;
}

export const enum ComponentType {
  Text = 0,
  Image = 1,
  TextImage = 2,
  Icon = 3,
  Video = 4,
  Launch = 5,
}

const componentSchema = new Schema<IUserComponent>(
  {
    text: { type: String },
    url: { type: String },
    style: {
      type: {
        backgroundColor: { type: String },
        backgroundImage: { type: String },
        backgroundSize: { type: String },
        backgroundPosition: { type: String },
        color: { type: String },
      },
    },
    visible: { type: Boolean, required: true },
    clicks: { type: Number, required: true },
    layout: {
      type: {
        rows: { type: Number, required: true },
        columns: { type: Number, required: true },
      },
      required: true,
    },
    type: { type: Number, required: true },
    mediaUrl: { type: String },
    iconDetails: {
      type: {
        rows: { type: Number, required: true },
        columns: { type: Number, required: true },
      },
    },
    visibleDate: { type: String },
    launchDate: { type: String },
    animation: {
      type: {
        name: { type: String, required: true },
        startDelay: { type: Number, required: true },
        duration: { type: Number, required: true },
        infinite: { type: Boolean, required: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

const pageSchema = new Schema<IUserPage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    pageImageUrl: { type: String },
    isPublic: { type: Boolean, required: true },
    views: { type: Number, required: true },
    style: {
      type: {
        backgroundColor: { type: String },
        backgroundImage: { type: String },
        backgroundSize: { type: String },
        backgroundPosition: { type: String },
        color: { type: String },
      },
    },
    topComponents: { type: [componentSchema] },
    middleComponents: { type: [componentSchema] },
    bottomComponents: { type: [componentSchema] },
  },
  {
    timestamps: true,
  }
);

export default model<IUserPage>("Pages", pageSchema);
