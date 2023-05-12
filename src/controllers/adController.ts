import { Request, Response, NextFunction } from "express";
import {
  AWSS3,
  AWSSES,
  GOOGLE_GEOCODER,
  generateRandomAlphaNumeric,
} from "../config";
import slugify from "slugify";
import Ad from "../models/adModel";
import User, { IUser } from "../models/userModel";
import { emailTemplate } from "../utils/email";
import { JwtPayload } from "jsonwebtoken";
import AWS from 'aws-sdk';


export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    const base64Image = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "kjt-realist-app-bucket",
      Key: `${generateRandomAlphaNumeric(6)}.${type}`,
      Body: base64Image,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    AWS.config.logger = console;
    AWSS3.upload(params, (err: any, data: any) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.send(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Upload failed. Try again." });
  }
};

export const removeImage = (req: Request, res: Response) => {
  try {
    const { Key, Bucket } = req.body;

    AWSS3.deleteObject({ Bucket, Key }, (err: any, data: any) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.send({ ok: true });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const create = async (req: JwtPayload, res: Response) => {
  try {
    const { photos, description, title, address, price, type, landsize } =
      req.body;
    if (!photos?.length) {
      return res.json({ error: "Photos are required" });
    }
    if (!price) {
      return res.json({ error: "Price is required" });
    }
    if (!type) {
      return res.json({ error: "Is property house or land?" });
    }
    if (!address) {
      return res.json({ error: "Address is required" });
    }
    if (!description) {
      return res.json({ error: "Description is required" });
    }

    const geo = await GOOGLE_GEOCODER.geocode(address);
    // console.log("geo => ", geo);
    const ad = await new Ad({
      ...req.body,
      postedBy: req.user._id,
      location: {
        type: "Point",
        coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
      },
      googleMap: geo,
      slug: slugify(
        `${type}-${address}-${price}-${generateRandomAlphaNumeric(6)}`
      ),
    }).save();

    // change user role to Seller
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { role: "Seller" }, //avoid duplicate and we not insert Seller again even if the seller add more ad i.e Seller + Seller
      },
      { new: true }
    );

    user!.password = undefined as any;
    user!.resetCode = undefined;

    res.json({
      ad,
      user,
    });
  } catch (err) {
    res.json({ error: "Something went wrong. Try again." });
    console.log(err);
  }
};

export const ads = async (req: Request, res: Response) => {
  try {
    const adsForSell = await Ad.find({ action: "Sell" })
      .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
      .sort({ createdAt: -1 })
      .limit(12);

    const adsForRent = await Ad.find({ action: "Rent" })
      .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({ adsForSell, adsForRent });
  } catch (err) {
    console.log(err);
  }
};

export const read = async (req: Request, res: Response) => {
  try {
    const ad = await Ad.findOne({ slug: req.params.slug }).populate(
      "postedBy",
      "name username email phone company photo.Location"
    );

    // related
    const related = await Ad.find({
      _id: { $ne: ad!._id },
      action: ad!.action,
      type: ad!.type,
      address: {
        $regex: ad!.googleMap[0]?.admininstrativeLevels?.levelllong || "",
        $options: "i", //ignore lowercase/uppercase characters
      },
    })
      .limit(3)
      .select("-photos.Key -photos.key -photos.ETag -photos.Bucket -googleMap");

    res.json({ ad, related });
  } catch (err) {
    console.log(err);
  }
};

// export const addToWishlist = async (req: JwtPayload, res: Response) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         $addToSet: { wishlist: req.body.adId },
//       },
//       { new: true }
//     );

//     const { password, resetCode, ...rest } = user!._doc;

//     // console.log("added to wishlist => ", rest);

//     res.json(rest);
//   } catch (err) {
//     console.log(err);
//   }
// };


// export const addToWishlist = async (req: JwtPayload, res: Response): Promise<void> => {
//   try {
//   const user: IUser | null = await User.findByIdAndUpdate(
//   req.user._id,
//   {
//     $addToSet: { wishlist: req.body.adId },
//   },
//   { new: true }
// ).lean();

// if (!user) {
//   throw new Error("User not found");
// }

// const { password, resetCode, ...rest } = user;

// res.json(rest);

//   } catch (err: any) {
//     console.log(err);
//     res.status(500).send("Internal Server Error");
//   }
// };


// export const removeFromWishlist = async (req: JwtPayload, res: Response) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         $pull: { wishlist: req.params.adId },
//       },
//       { new: true }
//     );

//     const { password, resetCode, ...rest } = user!._doc;
//     // console.log("remove from wishlist => ", rest);

//     res.json(rest);
//   } catch (err) {
//     console.log(err);
//   }
// };

// export const contactSeller = async (req: JwtPayload, res: Response) => {
//   try {
//     const { name, email, message, phone, adId } = req.body;
//     const ad = await Ad.findById(adId).populate("postedBy", "email");

//     const user = await User.findByIdAndUpdate(req.user._id, {
//       $addToSet: { enquiredProperties: adId },
//     });

//     if (!user) {
//       return res.json({ error: "Could not find user with that email" });
//     } else {
//       // send email
//       AWSSES.sendEmail(
//         emailTemplate(
//           ad.postedBy.email,
//           `
//         <p>You have received a new customer enquiry</p>

//           <h4>Customer details</h4>
//           <p>Name: ${name}</p>
//           <p>Email: ${email}</p>
//           <p>Phone: ${phone}</p>
//           <p>Message: ${message}</p>

//         <a href="${CLIENT_URL}/ad/${ad.slug}">${ad.type} in ${ad.address} for ${ad.action} ${ad.price}</a>
//         `,
//           email,
//           "New enquiry received"
//         ),
//         (err:any, data:any) => {
//           if (err) {
//             console.log(err);
//             return res.json({ ok: false });
//           } else {
//             console.log(data);
//             return res.json({ ok: true });
//           }
//         }
//       );
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };