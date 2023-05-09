import jwt, { JwtPayload } from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";
import { JWT_SECRET } from "../config";


export const requireSignin = (req: JwtPayload, res: Response, next: NextFunction) => {
  try {
    //   const token = req.headers.authorization;
    const decoded = jwt.verify(
      req.headers.authorization,
      JWT_SECRET
    );
    req.user = decoded; // req.user._id
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
