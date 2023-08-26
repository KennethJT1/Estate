"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Types.ObjectId,
            ref: "Ad",
        },
    ],
    wishlist: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Ad",
        },
    ],
    resetCode: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
