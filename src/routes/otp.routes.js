import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controllers.js";



const router=Router();


router.route("/send-otp").post(sendOtp)
router.route("/verify-otp").post(verifyOtp)

export default router