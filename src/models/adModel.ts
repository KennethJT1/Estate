import { Schema, Model, model, Document, Types } from "mongoose";

interface IAd extends Document {
  photos: object[];
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  landsize: string;
  carpark: number;
  location: {
    type: string;
    coordinates: number[];
  };
  title: string;
  slug: string;
  description: object;
  postedBy: any;
  sold: boolean;
  googleMap: any;
  type: string;
  action: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema: Schema = new Schema(
  {
    photos: [{}],
    price: { type: Number, maxLength: 255 },
    address: { type: String, maxLength: 255, required: true },
    bedrooms: Number,
    bathrooms: Number,
    landsize: String,
    carpark: Number,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [151.20929, -33.86882],
      },
    },
    title: {
      type: String,
      maxLength: 255,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {},
    postedBy: { type: Types.ObjectId, ref: "User" },
    sold: { type: Boolean, default: false },
    googleMap: {},
    type: {
      type: String,
      default: "Other",
    },
    action: {
      type: String,
      default: "Sell",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

AdSchema.index({ location: "2dsphere" });

const Ad: Model<IAd> = model<IAd>("Ad", AdSchema);

export default Ad;
