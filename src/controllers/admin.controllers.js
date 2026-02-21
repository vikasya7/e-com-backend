import { Item } from "../models/item.models.js";
import { Order } from "../models/order.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const getAdminStats=asyncHandler(async(req,res)=>{
    try {
        const totalProducts=await Item.countDocuments()
    
        const totalStock=await Item.aggregate([
            {
                $group:{
                    _id:null,
                    total:{
                        $sum:"$stock"
                    }
                }
            }
        ])
        const lowStock=await Item.countDocuments({stock:{$lt:5}})
        const totalOrders=await Order.countDocuments()
    
        const revenueAgg=await Order.aggregate([
           {
             $group:{
                _id:null,
                total:{
                    $sum:"$totalAmount"
                }
             }
           }
        ])
    
        res.json({
            totalProducts,
            totalStock:totalStock[0]?.total || 0,
            lowStock,
            totalOrders,
            revenue:revenueAgg[0]?.total || 0
        })
    } catch (error) {
        console.log("error while sendin admin dashboard details",error);
        
        throw new ApiError(400,"problem while sending admin dashboard details")
    }
})


 const promoteByEmail = asyncHandler(async (req, res) => {

  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "User is already admin");
  }

  user.role = "admin";
  await user.save();

  res.status(200).json(
    new ApiResponse(200,"user promoted successfully")
  )

});


export {getAdminStats,
    promoteByEmail
}