"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdSchema = new mongoose_1.Schema({
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
    postedBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
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
}, { timestamps: true });
AdSchema.index({ location: "2dsphere" });
const Ad = (0, mongoose_1.model)("Ad", AdSchema);
exports.default = Ad;
