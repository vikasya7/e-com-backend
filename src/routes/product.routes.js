import { Router } from "express";
import { addProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from "../controllers/product.controllers.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router=Router()
router.route("/:id").get(getSingleProduct)
router.route("/").get(getProducts)
router.route("/").post(verifyJWT,verifyAdmin,
    upload.array("images",5)
    ,addProduct)
router.route("/:id").delete(verifyJWT,verifyAdmin,deleteProduct)
router.route("/:id").put(verifyJWT,verifyAdmin,
    upload.array("images",5),updateProduct)

export default router