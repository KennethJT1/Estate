import { Request, Response, NextFunction } from "express";
import {
  AWSSES,
  DATABASE,
  EMAIL_FROM,
  REPLY_TO,
  JWT_SECRET,
  CLIENT_URL,
} from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { emailTemplate } from "../utils/email";
import { hashPassword, comparePassword } from "../utils/auth";
import User from "../models/userModel";
import {nanoid} from "nanoid";

export const welcome = (req: Request, res: Response) => {
  res.json({
    data: "hello from nodejs api from routes yay",
  });
};

export const preRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //create jwt with email and password and make email a clickable link
  //only when user clicked the mail can then be registered
  try {
    const { email, password } = req.body;
    const token = jwt.sign({ email, password }, JWT_SECRET, {
      expiresIn: "1h",
    });

    AWSSES.sendEmail(
      emailTemplate(
        email,
        `
            <p>Please click the link below to activate your account</p>
            <a href="${CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
        `,
        REPLY_TO,
        "Activate your account"
      ),
      (err: any, data: any) => {
        if (err) {
          console.log("myerr===>", err);
          return res.status(403).json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      }
    );
  } catch (error: any) {
    console.log("catch err pre-register==>", error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

export const register = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log("token===>", req.body.token)
    const { email, password } = jwt.verify(
      req.body.token,
      JWT_SECRET
    ) as JwtPayload;
    const hashedPassword = await hashPassword(password);

    const createUser = await User.create({
      username: nanoid(6),
      email,
      password: hashedPassword,
    });

    const user = await User.findOne({email}) 
     const token = jwt.sign({ _id: user?._id }, JWT_SECRET, {
       expiresIn: "1h",
     });
     const refreshToken = jwt.sign({ _id: user?._id }, JWT_SECRET, {
       expiresIn: "7d",
     });

    //  user!.password = undefined;
    //  user.resetCode = undefined;

     return res.json({
       token,
       refreshToken,
       user,
     });

    return res.status(201).json(user)
  } catch (error: any) {
    console.log("catch err register==>", error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

// export const  =(req: Request, res: Response, next: NextFunction) => {
//       try {

//      } catch (error:any) {
//          console.log(error.message)
//          return res.status(500).json({error: "Something went wrong, try again"})
//      }
//  };
// export const  =(req: Request, res: Response, next: NextFunction) => {
//       try {

//      } catch (error:any) {
//          console.log(error.message)
//          return res.status(500).json({error: "Something went wrong, try again"})
//      }
//  };
// export const  =(req: Request, res: Response, next: NextFunction) => {
//       try {

//      } catch (error:any) {
//          console.log(error.message)
//          return res.status(500).json({error: "Something went wrong, try again"})
//      }
//  };
// export const  =(req: Request, res: Response, next: NextFunction) => {
//       try {

//      } catch (error:any) {
//          console.log(error.message)
//          return res.status(500).json({error: "Something went wrong, try again"})
//      }
//  };
// export const  =(req: Request, res: Response, next: NextFunction) => {
//       try {

//      } catch (error:any) {
//          console.log(error.message)
//          return res.status(500).json({error: "Something went wrong, try again"})
//      }
//  };
// export const  =(req: Request, res: Response, next: NextFunction) => {
//       try {

//      } catch (error:any) {
//          console.log(error.message)
//          return res.status(500).json({error: "Something went wrong, try again"})
//      }
//  };
