import express from "express";
import {
  preRegister,
  register,
  login,
  forgotPassword,
  accessAccount,
} from "../controllers/authController";

const router = express.Router();

router.post("/pre-register", preRegister);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/access-account", accessAccount);

export default router;