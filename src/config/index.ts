import dotenv from "dotenv";
import { SES } from 'aws-sdk';
import { S3 } from 'aws-sdk';
import NodeGeocoder from "node-geocoder";

dotenv.config();

export const DATABASE = process.env.MONGO_URI as string;

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;


export const EMAIL_FROM = process.env.EMAIL_FROM as string;
export const REPLY_TO = process.env.REPLY_TO as string;

// const awsConfig = {
//   accessKeyId: AWS_ACCESS_KEY_ID,
//   secretAccessKey: AWS_SECRET_ACCESS_KEY,
//   region: "us-east-1",
//   apiVersion: "2010-12-01",
// };

const awsConfig = {
  accessKeyId: "AKIA3GABCL454X3XEGNI",
  secretAccessKey: "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",
  region: "us-east-1",
  apiVersion: "2010-12-01",
};

export const AWSSES = new SES(awsConfig);

export const AWSS3 = new S3(awsConfig);

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const CLIENT_URL = process.env.CLIENT_URL as string;

const options = {
  provider: "google",
  // apiKey: process.env.GOOGLE_APIKEY,
  apiKey: "AIzaSyC6K6VtEcwGTw09iSYxbiBIZ_wWb5fbdaU",
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