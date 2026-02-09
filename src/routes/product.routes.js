import { Router } from "express";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controllers.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router=Router()

router.route("/").get(getProducts)
router.route("/").post(verifyJWT,verifyAdmin,
    upload.single("image")
    ,addProduct)
router.route("/:id").delete(verifyJWT,verifyAdmin,deleteProduct)
router.route("/:id").put(verifyAdmin,updateProduct)

export default router