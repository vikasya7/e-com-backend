import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { placeOrder } from "../controllers/order.controllers.js";


const router=Router()

router.route("/place-order").post(verifyJWT,placeOrder)


export default router
