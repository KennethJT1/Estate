import express from "express";
import {
  preRegister,
  register,
  login,
  forgotPassword,
  accessAccount,
  refreshToken,
  currentUser,
  publicProfile,
  updatePassword,
  updateProfile,
} from "../controllers/authController";
import { requireSignin } from "../middlewares/auth";

const router = express.Router();

router.post("/pre-register", preRegister);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/access-account", accessAccount);
router.get("/refresh-token", refreshToken);
router.get("/current-user", requireSignin, currentUser);
router.get("/profile/:username", publicProfile);
router.put("/update-password", requireSignin, updatePassword);
router.put("/update-profile", requireSignin, updateProfile);

export default router;