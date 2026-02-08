import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {getUserDetails, loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const router=Router()


router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }
    ]),registerUser
)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/me").get(verifyJWT,getUserDetails)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/:id/make-admin").patch(verifyJWT,verifyAdmin,
    asyncHandler(async(req,res)=>{
        const user=await User.findByIdAndUpdate(
            req.params.id,
            {role:"admin"},
            {new:true}
        )
        res.json(user)
    })
)

export default router