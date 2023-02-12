import { Request, Response, NextFunction } from "express";
import {
  AWSSES,
  DATABASE,
  EMAIL_FROM,
  REPLY_TO,
  JWT_SECRET,
  CLIENT_URL,
  generateRandomAlphaNumeric,
} from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { emailTemplate } from "../utils/email";
import { hashPassword, comparePassword } from "../utils/auth";
import User from "../models/userModel";
import { nanoid } from "nanoid";
import validator from "email-validator";


const tokenAndUserResponse = (req: JwtPayload, res: Response, user:any) => {
  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined;
  user.resetCode = undefined;

  return res.json({
    token,
    refreshToken,
    user,
  });
};


export const preRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //create jwt with email and password and make email a clickable link
  //only when user clicked the mail can then be registered
  try {
    const { email, password } = req.body;

    // validataion
    if (!validator.validate(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (password && password?.length < 4) {
      return res
        .status(400)
        .json({ error: "Password should be at least 4 characters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Email is taken" });
    }

    const token = jwt.sign({ email, password }, JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("token", token);

    // AWSSES.sendEmail(
    //   emailTemplate(
    //     email,
    //     `
    //         <p>Please click the link below to activate your account</p>
    //         <a href="${CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
    //     `,
    //     REPLY_TO,
    //     "Activate your account"
    //   ),
    //   (err: any, data: any) => {
    //     if (err) {
    //       console.log("myerr===>", err);
    //       return res.status(403).json({ ok: false });
    //     } else {
    //       console.log(data);
    //       return res.json({ ok: true });
    //     }
    //   }
    // );

    // define the email message and options
    const params = {
      Destination: {
        ToAddresses: ["walexeniola081@gmail.com"],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "<p>HTML-formatted email body</p>",
          },
          Text: {
            Charset: "UTF-8",
            Data: "Plain-text email body",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Email subject",
        },
      },
      Source: "sender@example.com",
      ReplyToAddresses: ["kennetholuwatomiwa966@gmail.com"],
    };

    // send the email
    AWSSES.sendEmail(params, (err: any, data: any) => {
      if (err) {
        console.log("Error:", err);
      } else {
        console.log("Email sent:", data);
      }
    });
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
    // console.log("token===>", nanoid())
    const id = generateRandomAlphaNumeric(8);
    const { email, password } = jwt.verify(
      req.body.token,
      JWT_SECRET
    ) as JwtPayload;

     const existUser = await User.findOne({ email });
     if (existUser) {
       return res.status(400).json({ error: "Email is taken" });
     }
    
    const hashedPassword = await hashPassword(password);

    const createUser = await User.create({
      username: id,
      email,
      password: hashedPassword,
    });

    const user = await User.findOne({ email });
    tokenAndUserResponse(req, res, user);
  } catch (error: any) {
    console.log("catch err register==>", error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // 1 find user by email
    const user = await User.findOne({ email });
    // 2 compare password
    const match = await comparePassword(password, user?.password);
    if (!match) {
      return res.status(404).json({ error: "Wrong password" });
    }

   tokenAndUserResponse(req, res, user);
  } catch (error: any) {
    console.log("catch err login==>", error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // console.log("user===>", user);
    if (!user) {
      return res
        .status(404)
        .json({ error: "Could not find user with that email" });
    } else {
      const resetCode = generateRandomAlphaNumeric(10);
      user.resetCode = resetCode as unknown as string;
      user.save();

      const token = jwt.sign({ resetCode }, JWT_SECRET, {
        expiresIn: "1h",
      });

      console.log("Forgot password==>", token)

      AWSSES.sendEmail(
        emailTemplate(
          email,
          `
          <p>Please click the link below to access your account.</p>
          <a href="${CLIENT_URL}/auth/access-account/${token}">Access my account</a>
        `,
          REPLY_TO,
          "Access your account"
        ),
        (err: any, data: any) => {
          if (err) {
            console.log(err);
            return res.status(403).json({ ok: false });
          } else {
            console.log(data);
            return res.status(200).json({ ok: true });
          }
        }
      );
    }
  } catch (error: any) {
    console.log("catch err forgotPassword==>", error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

export const accessAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resetCode } = jwt.verify(
      req.body.resetCode,
      JWT_SECRET
    ) as JwtPayload;

    const user = await User.findOneAndUpdate({ resetCode }, { resetCode: "" });

   tokenAndUserResponse(req, res, user);
  } catch (error: any) {
    console.log("catch err accessAccount==>", error.message);
    return res.status(500).json({ error: "Something went wrong, try again" });
  }
};

export const  refreshToken =async (req: JwtPayload, res: Response, next: NextFunction) => {
      try {
        const { _id } = jwt.verify(
          req.headers.refresh_token,
         JWT_SECRET
        ) as JwtPayload;

        const user = await User.findById(_id);
        
        tokenAndUserResponse(req, res, user);
     } catch (error:any) {
         console.log("catch err refreshToken==>", error.message);
         return res.status(403).json({error: "Something went wrong, try again"})
     }
 };
    
    
export const currentUser = async(req: JwtPayload, res: Response, next: NextFunction) => {
  try {
       const user = await User.findById(req.user._id);
       user!.password = undefined as any;
       user!.resetCode = undefined;
       res.json(user);
    } catch (error: any) {
      console.log("catch err currentUser==>", error.message);
      return res.status(403).json({ error: "Forbidden" });
    }
  };


export const publicProfile = async(req: JwtPayload, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    user!.password = undefined as any;
    user!.resetCode = undefined;
    res.json(user);
  } catch (error: any) {
    console.log("catch err publicProfile==>", error.message);
    return res.status(404).json("User not found");
  }
};


export const updatePassword = async (req: JwtPayload, res: Response, next: NextFunction) => {
  try {
         const { password } = req.body;

         if (!password) {
           return res.json({ error: "Password is required" });
         }
         if (password && password?.length < 4) {
           return res.json({ error: "Password should be min 4 characters" });
         }

         const user = await User.findByIdAndUpdate(req.user._id, {
           password: await hashPassword(password),
         });

         res.json({ ok: true });
    } catch (error: any) {
      console.log("catch err publicProfile==>", error.message);
      return res.status(403).json({ error: "Unauhorized" });
    }
  };


export const updateProfile = async(req: JwtPayload, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    user!.password = undefined as any;
    user!.resetCode = undefined;
    res.json(user);
  } catch (err:any) {
    console.log(err);
    if (err.codeName === "DuplicateKey") {
      return res.json({ error: "Username or email is already taken" });
    } else {
      return res.status(403).json({ error: "Unauhorized" });
    }
  }
};


// export const publicProfile = async(req: Request, res: Response, next: NextFunction) => {
//   try {
//   } catch (error: any) {
//     console.log("catch err publicProfile==>", error.message);
//     return res.status(500).json({ error: "Something went wrong, try again" });
//   }
// };
