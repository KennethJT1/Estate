"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.adsForRent = exports.adsForSell = exports.wishlist = exports.enquiriedProperties = exports.remove = exports.update = exports.userAds = exports.contactSeller = exports.removeFromWishlist = exports.addToWishlist = exports.read = exports.ads = exports.create = exports.removeImage = exports.uploadImage = void 0;
const config_1 = require("../config");
const slugify_1 = __importDefault(require("slugify"));
const adModel_1 = __importDefault(require("../models/adModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const email_1 = require("../utils/email");
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { image } = req.body;
        const base64Image = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const type = image.split(";")[0].split("/")[1];
        // image params
        const params = {
            Bucket: "kjt-realist-app-bucket",
            Key: `${(0, config_1.generateRandomAlphaNumeric)(6)}.${type}`,
            Body: base64Image,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: `image/${type}`,
        };
        // AWS.config.logger = console;
        config_1.AWSS3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            else {
                res.send(data);
            }
        });
    }
    catch (err) {
        console.log(err);
        res.json({ error: "Upload failed. Try again." });
    }
});
exports.uploadImage = uploadImage;
const removeImage = (req, res) => {
    try {
        const { Key, Bucket } = req.body;
        config_1.AWSS3.deleteObject({ Bucket, Key }, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            else {
                res.send({ ok: true });
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.removeImage = removeImage;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { photos, description, title, address, price, type, landsize } = req.body;
        if (!(photos === null || photos === void 0 ? void 0 : photos.length)) {
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
        const geo = yield config_1.GOOGLE_GEOCODER.geocode(address);
        const ad = yield new adModel_1.default(Object.assign(Object.assign({}, req.body), { postedBy: req.user._id, location: {
                type: "Point",
                coordinates: [(_a = geo === null || geo === void 0 ? void 0 : geo[0]) === null || _a === void 0 ? void 0 : _a.longitude, (_b = geo === null || geo === void 0 ? void 0 : geo[0]) === null || _b === void 0 ? void 0 : _b.latitude],
            }, googleMap: geo, slug: (0, slugify_1.default)(`${type}-${address}-${price}-${(0, config_1.generateRandomAlphaNumeric)(6)}`) })).save();
        // change user role to Seller
        const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
            $addToSet: { role: "Seller" }, //avoid duplicate and we not insert Seller again even if the seller add more ad i.e Seller + Seller
        }, { new: true });
        user.password = undefined;
        user.resetCode = undefined;
        res.json({
            ad,
            user,
        });
    }
    catch (err) {
        res.json({ error: "Something went wrong. Try again." });
        console.log(err);
    }
});
exports.create = create;
const ads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adsForSell = yield adModel_1.default.find({ action: "Sell" })
            .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
            .sort({ createdAt: -1 })
            .limit(12);
        const adsForRent = yield adModel_1.default.find({ action: "Rent" })
            .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
            .sort({ createdAt: -1 })
            .limit(12);
        res.json({ adsForSell, adsForRent });
    }
    catch (err) {
        console.log(err);
    }
});
exports.ads = ads;
const read = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const ad = yield adModel_1.default.findOne({ slug: req.params.slug }).populate("postedBy", "name username email phone company photo.Location");
        // related
        const related = yield adModel_1.default.find({
            _id: { $ne: ad._id },
            action: ad.action,
            type: ad.type,
            address: {
                $regex: ((_d = (_c = ad.googleMap[0]) === null || _c === void 0 ? void 0 : _c.admininstrativeLevels) === null || _d === void 0 ? void 0 : _d.levelllong) || "",
                $options: "i", //ignore lowercase/uppercase characters
            },
        })
            .limit(3)
            .select("-photos.Key -photos.key -photos.ETag -photos.Bucket -googleMap");
        res.json({ ad, related });
    }
    catch (err) {
        console.log(err);
    }
});
exports.read = read;
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
            $addToSet: { wishlist: req.body.adId },
        }, { new: true });
        const _e = user, { password, resetCode } = _e, rest = __rest(_e, ["password", "resetCode"]);
        res.json(rest);
    }
    catch (err) {
        console.log(err);
    }
});
exports.addToWishlist = addToWishlist;
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
            $pull: { wishlist: req.params.adId },
        }, { new: true });
        const _f = user, { password, resetCode } = _f, rest = __rest(_f, ["password", "resetCode"]);
        res.json(rest);
    }
    catch (err) {
        console.log(err);
    }
});
exports.removeFromWishlist = removeFromWishlist;
const contactSeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, message, phone, adId } = req.body;
        const ad = yield adModel_1.default.findById(adId).populate('postedBy', 'email');
        const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
            $addToSet: { enquiredProperties: adId },
        });
        if (!user) {
            return res.json({ error: 'Could not find user with that email' });
        }
        else {
            // send email
            config_1.AWSSES.sendEmail((0, email_1.emailTemplate)(ad.postedBy.email, `
        <p>You have received a new customer enquiry</p>

          <h4>Customer details</h4>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Phone: ${phone}</p>
          <p>Message: ${message}</p>

        <a href="${config_1.CLIENT_URL}/ad/${ad.slug}">${ad.type} in ${ad.address} for ${ad.action} ${ad.price}</a>
        `, email, 'New enquiry received'), (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({ ok: false });
                }
                else {
                    console.log(data);
                    return res.json({ ok: true });
                }
            });
        }
    }
    catch (err) {
        console.log(err);
    }
});
exports.contactSeller = contactSeller;
const userAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const perPage = 2;
        const page = req.params.page ? req.params.page : 1;
        const total = yield adModel_1.default.find({ postedBy: req.user._id });
        const ads = yield adModel_1.default.find({ postedBy: req.user._id })
            .populate("postedBy", "name email username phone company")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });
        res.json({ ads, total: total.length });
    }
    catch (err) {
        console.log(err);
    }
});
exports.userAds = userAds;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
        const { photos, price, type, address, description } = req.body;
        const ad = yield adModel_1.default.findById(req.params._id);
        const owner = req.user._id == (ad === null || ad === void 0 ? void 0 : ad.postedBy);
        if (!owner) {
            return res.json({ error: "Permission denied" });
        }
        else {
            // validation
            if (!photos.length) {
                return res.json({ error: "Photos are required" });
            }
            if (!price) {
                return res.json({ error: "Price is required" });
            }
            if (!type) {
                return res.json({ error: "Is property hour or land?" });
            }
            if (!address) {
                return res.json({ error: "Address is required" });
            }
            if (!description) {
                return res.json({ error: "Description are required" });
            }
            const geo = yield config_1.GOOGLE_GEOCODER.geocode(address);
            yield ad.update(Object.assign(Object.assign({}, req.body), { slug: ad.slug, location: {
                    type: "Point",
                    coordinates: [(_g = geo === null || geo === void 0 ? void 0 : geo[0]) === null || _g === void 0 ? void 0 : _g.longitude, (_h = geo === null || geo === void 0 ? void 0 : geo[0]) === null || _h === void 0 ? void 0 : _h.latitude],
                } }));
            res.json({ ok: true });
        }
    }
    catch (err) {
        console.log(err);
    }
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ad = yield adModel_1.default.findById(req.params._id);
        const owner = req.user._id == (ad === null || ad === void 0 ? void 0 : ad.postedBy);
        if (!owner) {
            return res.json({ error: "Permission denied" });
        }
        else {
            yield adModel_1.default.findByIdAndRemove(ad._id);
            res.json({ ok: true });
        }
    }
    catch (err) {
        console.log(err);
    }
});
exports.remove = remove;
const enquiriedProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user._id);
        const ads = yield adModel_1.default.find({ _id: user.enquiredProperties }).sort({
            createdAt: -1,
        });
        res.json(ads);
    }
    catch (err) {
        console.log(err);
    }
});
exports.enquiriedProperties = enquiriedProperties;
const wishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user._id);
        const ads = yield adModel_1.default.find({ _id: user.wishlist }).sort({
            createdAt: -1,
        });
        res.json(ads);
    }
    catch (err) {
        console.log(err);
    }
});
exports.wishlist = wishlist;
const adsForSell = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ads = yield adModel_1.default.find({ action: "Sell" })
            .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
            .sort({ createdAt: -1 })
            .limit(24);
        res.json(ads);
    }
    catch (err) {
        console.log(err);
    }
});
exports.adsForSell = adsForSell;
const adsForRent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ads = yield adModel_1.default.find({ action: "Rent" })
            .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
            .sort({ createdAt: -1 })
            .limit(24);
        res.json(ads);
    }
    catch (err) {
        console.log(err);
    }
});
exports.adsForRent = adsForRent;
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    try {
        console.log("req query", req.query);
        const { action, address, type, priceRange } = req.query;
        const geo = yield config_1.GOOGLE_GEOCODER.geocode(address);
        const ads = yield adModel_1.default.find({
            action: action === "Buy" ? "Sell" : "Rent",
            type,
            price: {
                $gte: parseInt(priceRange[0]),
                $lte: parseInt(priceRange[1]),
            },
            location: {
                $near: {
                    $maxDistance: 50000,
                    $geometry: {
                        type: "Point",
                        coordinates: [(_j = geo === null || geo === void 0 ? void 0 : geo[0]) === null || _j === void 0 ? void 0 : _j.longitude, (_k = geo === null || geo === void 0 ? void 0 : geo[0]) === null || _k === void 0 ? void 0 : _k.latitude],
                    },
                },
            },
        })
            .limit(24)
            .sort({ createdAt: -1 })
            .select("-photos.key -photos.Key -photos.ETag -photos.Bucket -location -googleMap");
        res.json(ads);
    }
    catch (err) {
        console.log();
    }
});
exports.search = search;
