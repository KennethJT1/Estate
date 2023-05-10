import { model, Schema, Types } from "mongoose";

interface Ad {
  photos: [{}];
  price: number;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  landsize: string;
  carpark?: number;
  location: {};
  title: string;
  slug: string;
  description: {};
  postedBy: {};
  sold?: boolean;
  googleMap: {};
  type: string;
  action: string;
  views?: number;
}

const adSchema = new Schema<Ad>(
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
        default: [3.41239, 6.46276],
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
    postedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
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

adSchema.index({ location: "2dsphere" });
export default model("Ad", adSchema);
