import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { getAdminStats, promoteByEmail } from "../controllers/admin.controllers.js";



const router=Router()


router.route('/stats').get(verifyJWT,verifyAdmin,getAdminStats)
router.route('/promote').patch(verifyJWT,verifyAdmin,promoteByEmail)

export default router