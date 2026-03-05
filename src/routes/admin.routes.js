import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { confirmOrder, getAdminStats, getAllOrders, promoteByEmail } from "../controllers/admin.controllers.js";



const router=Router()


router.route('/stats').get(verifyJWT,verifyAdmin,getAdminStats)
router.route('/promote').patch(verifyJWT,verifyAdmin,promoteByEmail)
router.route('/orders/:id/confirm').patch(verifyJWT,verifyAdmin,confirmOrder)
router.route('/orders').get(verifyJWT,verifyAdmin,getAllOrders)

export default router