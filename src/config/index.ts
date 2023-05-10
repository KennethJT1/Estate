import dotenv from "dotenv";
// import SES from "aws-sdk/clients/ses.js";
import S3 from "aws-sdk/clients/s3.js";
import { SES } from "aws-sdk";
import NodeGeocoder from "node-geocoder";

dotenv.config();

export const DATABASE = process.env.MONGO_URI as string;

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// const estate = "KJT Estate";
// const mail = process.env.EMAIL_FROM;
export const EMAIL_FROM = process.env.EMAIL_FROM as string;
export const REPLY_TO = process.env.REPLY_TO as string;

const awsConfig = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
  apiVersion: "2010-12-01",
};

export const AWSSES = new SES(awsConfig);

export const AWSS3 = new S3(awsConfig);

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const CLIENT_URL = process.env.CLIENT_URL as string;

const options = {
  provider: process.env.GOOGLE_PROVIDER,
  apiKey: process.env.GOOGLE_APIKEY,
  formatter: null,
} as unknown as any;

export const GOOGLE_GEOCODER = NodeGeocoder(options); 

export function generateRandomAlphaNumeric(length:any) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}