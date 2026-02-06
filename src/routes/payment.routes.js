import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controllers.js";


const router=Router()


router.route("/create").post(verifyJWT,createPaymentOrder)
router.route("/verify").post(verifyJWT,verifyPayment)

export default router