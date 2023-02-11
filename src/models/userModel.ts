import { model, Schema, Types } from "mongoose";

interface User {
  username: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  company?: string;
  phone?: string;
  photo?: {};
  role?: {};
  enquiredProperties?: [];
  wishlist?: [];
  resetCode?: "";
}



const userSchema = new Schema<User>({
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
    default: "",
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    maxLength: 256,
  },
  address: {
    type: String,
    default: "",
  },
  company: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  photo: {},
  role: {
    type: [String],
    default: ["Buyer"],
    enum: ["Buyer", "Admin", "Seller"],
  },
  enquiredProperties: [
    {
      type: Types.ObjectId,
      ref: "Ad",
    },
  ],
  wishlist: [
    {
      type: Types.ObjectId,
      ref: "Ad",
    },
  ],
  resetCode: "",
}, {
    timestamps: true,
});

export default model("User", userSchema);