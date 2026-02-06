import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToCart, clearCart, getCart, removeFromCart, updateQuantity } from "../controllers/cart.controllers.js";


const router=Router()


router.route("/cart/add").post(verifyJWT,addToCart)
router.route("/cart-remove").post(verifyJWT,removeFromCart)
router.route("/cart-update").put(verifyJWT,updateQuantity)
router.route("/cart").get(verifyJWT,getCart)
router.route("/cart-clear").post(verifyJWT,clearCart)


export default router