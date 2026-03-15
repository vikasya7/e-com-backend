import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { confirmOrder, getAdminStats, getAllOrders, getProductStocks, packOrder, promoteByEmail, updateVariantStock } from "../controllers/admin.controllers.js";



const router=Router()


router.route('/stats').get(verifyJWT,verifyAdmin,getAdminStats)
router.route('/promote').patch(verifyJWT,verifyAdmin,promoteByEmail)
router.route('/orders/:id/confirm').patch(verifyJWT,verifyAdmin,confirmOrder)
router.route('/orders').get(verifyJWT,verifyAdmin,getAllOrders)
router.route('/orders/:id/pack').patch(verifyJWT,verifyAdmin,packOrder)
router.route('/product-stock').get(verifyJWT,verifyAdmin,getProductStocks)
router.route('/products/:productId/stock').patch(verifyJWT,verifyAdmin,updateVariantStock)

export default router