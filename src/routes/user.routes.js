import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {loginUser, refreshAccessToken, registerUser} from "../controllers/user.controllers.js"

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


export default router