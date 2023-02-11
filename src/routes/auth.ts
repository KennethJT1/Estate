import express from "express";
import { preRegister, register } from "../controllers/authController";

const router = express.Router();

router.post("/pre-register", preRegister);
router.post("/register", register);

export default router;