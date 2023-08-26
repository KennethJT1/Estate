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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = exports.agentAdCount = exports.agents = exports.updateProfile = exports.updatePassword = exports.publicProfile = exports.currentUser = exports.refreshToken = exports.accessAccount = exports.forgotPassword = exports.login = exports.register = exports.preRegister = void 0;
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const auth_1 = require("../utils/auth");
const userModel_1 = __importDefault(require("../models/userModel"));
const email_validator_1 = __importDefault(require("email-validator"));
const adModel_1 = __importDefault(require("../models/adModel"));
const tokenAndUserResponse = (req, res, user) => {
    const token = jsonwebtoken_1.default.sign({ _id: user._id }, config_1.JWT_SECRET, {
        expiresIn: "1h",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, config_1.JWT_SECRET, {
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
const preRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // create jwt with email and password then email as clickable link
    // only when user click on that email link, registeration completes
    try {
        const { email, password } = req.body;
        if (!email_validator_1.default.validate(email)) {
            return res.json({ error: "A valid email is required" });
        }
        if (!password) {
            return res.json({ error: "Password is required" });
        }
        if (password && (password === null || password === void 0 ? void 0 : password.length) < 4) {
            return res.json({ error: "Password should be at least 4 characters" });
        }
        const user = yield userModel_1.default.findOne({ email });
        if (user) {
            return res.json({ error: "Email is taken" });
        }
        const token = jsonwebtoken_1.default.sign({ email, password }, config_1.JWT_SECRET, {
            expiresIn: "1h",
        });
        console.log("token", token);
        config_1.AWSSES.sendEmail((0, email_1.emailTemplate)(email, `
      <p>Please click the link below to activate your account.</p>
      <a href="${config_1.CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
      `, config_1.REPLY_TO, "Activate your acount"), (err, data) => {
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
    catch (err) {
        console.log(err);
        return res.json({ error: "Something went wrong. Try again." });
    }
});
exports.preRegister = preRegister;
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = (0, config_1.generateRandomAlphaNumeric)(8);
        const { email, password } = jsonwebtoken_1.default.verify(req.body.token, config_1.JWT_SECRET);
        const existUser = yield userModel_1.default.findOne({ email });
        if (existUser) {
            return res.json({ error: "Email is taken" });
        }
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const createUser = yield userModel_1.default.create({
            username: id,
            email,
            password: hashedPassword,
        });
        const user = yield userModel_1.default.findOne({ email });
        tokenAndUserResponse(req, res, user);
    }
    catch (error) {
        console.log("catch err register==>", error.message);
        return res.json({ error: "Something went wrong, try again" });
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return res.json({ error: "User not found. You need to register" });
        }
        const match = yield (0, auth_1.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password);
        if (!match) {
            return res.json({ error: "Wrong password" });
        }
        tokenAndUserResponse(req, res, user);
    }
    catch (error) {
        console.log("catch err login==>", error.message);
        return res.status(500).json({ error: "Something went wrong, try again" });
    }
});
exports.login = login;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        // console.log("user===>", user);
        if (!user) {
            return res
                .json({ error: "Could not find user with that email" });
        }
        else {
            const resetCode = (0, config_1.generateRandomAlphaNumeric)(10);
            user.resetCode = resetCode;
            user.save();
            const token = jsonwebtoken_1.default.sign({ resetCode }, config_1.JWT_SECRET, {
                expiresIn: "1h",
            });
            console.log("Forgot password==>", token);
            config_1.AWSSES.sendEmail((0, email_1.emailTemplate)(email, `
          <p>Please click the link below to access your account.</p>
          <a href="${config_1.CLIENT_URL}/auth/access-account/${token}">Access my account</a>
        `, config_1.REPLY_TO, "Access your account"), (err, data) => {
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
    catch (error) {
        console.log("catch err forgotPassword==>", error.message);
        return res.json({ error: "Something went wrong, try again" });
    }
});
exports.forgotPassword = forgotPassword;
const accessAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetCode } = jsonwebtoken_1.default.verify(req.body.resetCode, config_1.JWT_SECRET);
        const user = yield userModel_1.default.findOneAndUpdate({ resetCode }, { resetCode: "" });
        tokenAndUserResponse(req, res, user);
    }
    catch (error) {
        console.log("catch err accessAccount==>", error.message);
        return res.json({ error: "Something went wrong, try again" });
    }
});
exports.accessAccount = accessAccount;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = jsonwebtoken_1.default.verify(req.headers.refresh_token, config_1.JWT_SECRET);
        const user = yield userModel_1.default.findById(_id);
        tokenAndUserResponse(req, res, user);
    }
    catch (error) {
        console.log("catch err refreshToken==>", error.message);
        return res.status(403).json({ error: "Something went wrong, try again" });
    }
});
exports.refreshToken = refreshToken;
const currentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user._id);
        user.password = undefined;
        user.resetCode = undefined;
        res.json(user);
    }
    catch (error) {
        console.log("catch err currentUser==>", error.message);
        return res.status(403).json({ error: "Forbidden" });
    }
});
exports.currentUser = currentUser;
const publicProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ username: req.params.username });
        user.password = undefined;
        user.resetCode = undefined;
        res.json(user);
    }
    catch (error) {
        console.log("catch err publicProfile==>", error.message);
        return res.status(404).json("User not found");
    }
});
exports.publicProfile = publicProfile;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        if (!password) {
            return res.json({ error: "Password is required" });
        }
        if (password && (password === null || password === void 0 ? void 0 : password.length) < 4) {
            return res.json({ error: "Password should be min 4 characters" });
        }
        const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
            password: yield (0, auth_1.hashPassword)(password),
        });
        res.json({ ok: true });
    }
    catch (error) {
        console.log("catch err publicProfile==>", error.message);
        return res.status(403).json({ error: "Unauhorized" });
    }
});
exports.updatePassword = updatePassword;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
        });
        user.password = undefined;
        user.resetCode = undefined;
        res.json(user);
    }
    catch (err) {
        console.log(err);
        if (err.codeName === "DuplicateKey") {
            return res.json({ error: "Username or email is already taken" });
        }
        else {
            return res.status(403).json({ error: "Unauhorized" });
        }
    }
});
exports.updateProfile = updateProfile;
const agents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agents = yield userModel_1.default.find({ role: "Seller" }).select("-password -role -enquiredProperties -wishlist -photo.key -photo.Key -photo.Bucket");
        res.json(agents);
    }
    catch (err) {
        console.log(err);
    }
});
exports.agents = agents;
const agentAdCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ads = yield adModel_1.default.find({ postedBy: req.params._id }).select("_id");
        res.json(ads);
    }
    catch (err) {
        console.log(err);
    }
});
exports.agentAdCount = agentAdCount;
const agent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ username: req.params.username }).select("-password -role -enquiredProperties -wishlist -photo.key -photo.Key -photo.Bucket");
        const ads = yield adModel_1.default.find({ postedBy: user._id }).select("-photos.key -photos.Key -photos.ETag -photos.Bucket -location -googleMap");
        res.json({ user, ads });
    }
    catch (err) {
        console.log(err);
    }
});
exports.agent = agent;
