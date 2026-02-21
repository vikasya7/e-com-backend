import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cancelOrder, getMyOrders, getSingleOrder, placeOrder } from "../controllers/order.controllers.js";


const router=Router()

router.route("/place-order").post(verifyJWT,placeOrder)
router.route("/my-orders").get(verifyJWT,getMyOrders)
router.route("/:id").get(verifyJWT,getSingleOrder)
router.route("/:id/cancel",verifyJWT,cancelOrder)

export default router
