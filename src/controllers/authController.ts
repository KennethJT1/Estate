import { Request, Response, NextFunction } from "express";
import {
  AWSSES,
  DATABASE,
  EMAIL_FROM,
  REPLY_TO,
  JWT_SECRET,
  CLIENT_URL,
} from "../config";
import jwt from "jsonwebtoken";
import { emailTemplate } from "../utils/email";

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
          console.log("myerr===>",err);
          return res.status(403).json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      }
    );
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error: any) {
    console.log(error.message);
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
