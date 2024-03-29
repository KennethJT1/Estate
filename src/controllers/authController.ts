import { Request, Response, NextFunction } from "express";
import {
  AWSSES,
  REPLY_TO,
  JWT_SECRET,
  CLIENT_URL,
  generateRandomAlphaNumeric,
} from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { emailTemplate } from "../utils/email";
import { hashPassword, comparePassword } from "../utils/auth";
import User from "../models/userModel";
import validator from "email-validator";
import Ad from "../models/adModel";


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
  // create jwt with email and password then email as clickable link
  // only when user click on that email link, registeration completes
  try {
    const { email, password } = req.body;

    if (!validator.validate(email)) {
      return res.json({ error: "A valid email is required" });
    }
    if (!password) {
      return res.json({ error: "Password is required" });
    }
    if (password && password?.length < 4) {
      return res.json({ error: "Password should be at least 4 characters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ error: "Email is taken" });
    }

    const token = jwt.sign({ email, password }, JWT_SECRET, {
      expiresIn: "1h",
    });

console.log("token", token);

    AWSSES.sendEmail(
      emailTemplate(
        email,
        `
      <p>Please click the link below to activate your account.</p>
      <a href="${CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
      `,
        REPLY_TO,
        "Activate your acount"
      ),
      (err, data) => {
        if (err) {
          console.log(err);
          return res.json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      }
    );
  } catch (err) {
    console.log(err);
    return res.json({ error: "Something went wrong. Try again." });
  }
};


export const register = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = generateRandomAlphaNumeric(8);
    const { email, password } = jwt.verify(
      req.body.token,
      JWT_SECRET
    ) as JwtPayload;

     const existUser = await User.findOne({ email });
     if (existUser) {
       return res.json({ error: "Email is taken" });
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
    return res.json({ error: "Something went wrong, try again" });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found. You need to register" });
    }
    const match = await comparePassword(password, user?.password);
    if (!match) {
      return res.json({ error: "Wrong password" });
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
            return res.json({ ok: false });
          } else {
            console.log(data);
            return res.json({ ok: true });
          }
        }
      );
    }
  } catch (error: any) {
    console.log("catch err forgotPassword==>", error.message);
    return res.json({ error: "Something went wrong, try again" });
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
    return res.json({ error: "Something went wrong, try again" });
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


export const agents = async (req: Request, res: Response) => {
  try {
    const agents = await User.find({ role: "Seller" }).select(
      "-password -role -enquiredProperties -wishlist -photo.key -photo.Key -photo.Bucket"
    );
    res.json(agents);
  } catch (err) {
    console.log(err);
  }
};

export const agentAdCount = async (req: Request, res: Response) => {
  try {
    const ads = await Ad.find({ postedBy: req.params._id }).select("_id");
    res.json(ads);
  } catch (err) {
    console.log(err);
  }
};

export const agent = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -role -enquiredProperties -wishlist -photo.key -photo.Key -photo.Bucket"
    );
    const ads = await Ad.find({ postedBy: user!._id }).select(
      "-photos.key -photos.Key -photos.ETag -photos.Bucket -location -googleMap"
    );
    res.json({ user, ads });
  } catch (err) {
    console.log(err);
  }
}; 