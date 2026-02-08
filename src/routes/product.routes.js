import { Router } from "express";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controllers.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";



const router=Router()

router.route("/").get(getProducts)
router.route("/").post(verifyAdmin,addProduct)
router.route("/:id").delete(verifyAdmin,deleteProduct)
router.route("/:id").put(verifyAdmin,updateProduct)

export default router