"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSignin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const requireSignin = (req, res, next) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(req.headers.authorization, config_1.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.requireSignin = requireSignin;
