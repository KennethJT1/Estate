import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { JWT_SECRET } from "../config";


export const requireSignin = (req: JwtPayload, res: Response, next: NextFunction) => {
  try {
    const decoded = jwt.verify(req.headers.authorization, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
