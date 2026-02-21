import { Router } from "express";
import { createCoupon, deleteCoupon, getAllCoupons, toggleCouponStatus } from "../controllers/coupon.controllers.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router=Router()


router.route("/create").post(verifyJWT,verifyAdmin,createCoupon)
router.route("/").get(verifyJWT,verifyAdmin,getAllCoupons)
router.route("/toggle/:id").patch(verifyJWT,verifyAdmin,toggleCouponStatus)
router.route("/:id",verifyJWT,verifyAdmin,deleteCoupon)

export default router