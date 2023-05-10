import { Request, Response, NextFunction } from "express";
import { AWSS3, GOOGLE_GEOCODER } from "../config";
import { nanoid } from "nanoid";
import slugify from "slugify";
import Ad from "../models/adModel";
import User from "../models/userModel";
import { emailTemplate } from "../utils/email";
import { JwtPayload } from "jsonwebtoken";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    const base64Image = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "realist-app-udemy-course-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Image,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

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
      slug: slugify(`${type}-${address}-${price}-${nanoid(6)}`),
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
    // console.log("AD => ", ad);

    // related
    const related = await Ad.find({
      _id: { $ne: ad!._id },
      action: ad!.action,
      type: ad!.type,
      address: {
        $regex: ad.googleMap[0]?.admininstrativeLevels?.levelllong || "",
        $options: "i",
      },
    })
      .limit(3)
      .select("-photos.Key -photos.key -photos.ETag -photos.Bucket -googleMap");

    res.json({ ad, related });
  } catch (err) {
    console.log(err);
  }
};
