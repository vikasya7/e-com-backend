import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/category.controllers.js";



const router=Router()


router.route("/").get(verifyJWT,verifyAdmin,getCategories)
router.route("/").post(verifyJWT,verifyAdmin,createCategory)
router.route("/:id").put(verifyJWT,verifyAdmin,updateCategory)
router.route("/:id",deleteCategory)

export default router