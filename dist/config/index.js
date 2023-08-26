"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomAlphaNumeric = exports.GOOGLE_GEOCODER = exports.CLIENT_URL = exports.JWT_SECRET = exports.AWSS3 = exports.AWSSES = exports.REPLY_TO = exports.EMAIL_FROM = exports.DATABASE = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const aws_sdk_1 = require("aws-sdk");
const aws_sdk_2 = require("aws-sdk");
const node_geocoder_1 = __importDefault(require("node-geocoder"));
dotenv_1.default.config();
exports.DATABASE = process.env.MONGO_URI;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
exports.EMAIL_FROM = process.env.EMAIL_FROM;
exports.REPLY_TO = process.env.REPLY_TO;
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    apiVersion: "2010-12-01",
};
exports.AWSSES = new aws_sdk_1.SES(awsConfig);
exports.AWSS3 = new aws_sdk_2.S3(awsConfig);
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.CLIENT_URL = process.env.CLIENT_URL;
const options = {
    provider: process.env.GOOGLE_PROVIDER,
    apiKey: process.env.GOOGLE_APIKEY,
    formatter: null,
};
exports.GOOGLE_GEOCODER = (0, node_geocoder_1.default)(options);
function generateRandomAlphaNumeric(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.generateRandomAlphaNumeric = generateRandomAlphaNumeric;
