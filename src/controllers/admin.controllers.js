import { Item } from "../models/item.models.js";
import { Order } from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
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


export {getAdminStats}