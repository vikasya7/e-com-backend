import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addAddress, deleteAddress, getUserAddresses, setDefaultAddress } from "../controllers/address.controllers.js";


const router=Router()


router.route("/addresses").get(verifyJWT,getUserAddresses)
router.route("/address").post(verifyJWT,addAddress)
router.route("/address/:id/default").patch(verifyJWT,setDefaultAddress)
router.route("/address/:id").delete(verifyJWT,deleteAddress)

export default router
