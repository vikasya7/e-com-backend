import { Coupon } from "../models/coupon.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const applyCoupon=asyncHandler(async(req,res)=>{
    const {code,orderAmount}=req.body

    if(!code){
        throw new ApiError(400,"code not found")
    }

    const coupon=await Coupon.findOne({code:code.toUpperCase()})

    if(!coupon || !coupon.active){
        throw new ApiError(400,"invalid coupon")
    }

    if(coupon.expiresAt && coupon.expiresAt<new Date()){
        throw new ApiError(400,"Coupon expired")
    }

    if(orderAmount < coupon.minOrderAmount){
        throw new ApiError(400,`Minimum order ₹${coupon.minOrderAmount}`)
    }

    let discount=0

    if(coupon.discountType==='percentage'){
        discount=(orderAmount*coupon.discountValue)/100
    }
    else{
        discount=coupon.discountValue
    }

    const newTotal=orderAmount-discount

    res.status(200).json(
        new ApiResponse(200,{discount,newTotal},"Coupon applied successfully")
    )
})

const createCoupon=asyncHandler(async(req,res)=>{
    const {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        expiresAt
    }=req.body;

    const existing=await Coupon.findOne({code:code.toUpperCase()})

    if(existing){
        throw new ApiError(400,"Coupon already exists")
    }

    const coupon=await Coupon.create({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        expiresAt
    })

    res.status(201).json(
        new ApiResponse(201,coupon,"Coupon created successfully")
    )
})

const getAllCoupons=asyncHandler(async(req,res)=>{
    const coupons=await Coupon.find().sort({createdAt:-1})

    res.status(200).json(
        new ApiResponse(200,coupons,"Coupons fetched successfully")
    )
})


const toggleCouponStatus = asyncHandler(async (req, res) => {

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  coupon.active = !coupon.active;
  await coupon.save();

  res.status(200).json(
    new ApiResponse(200, coupon, "Coupon status updated")
  );
});



const deleteCoupon=asyncHandler(async(req,res)=>{
    const coupon=await Coupon.findById(req.params.id)

    if(!coupon){
        throw new ApiError(400,"Coupon not found")
    }

    await coupon.deleteOne()

    res.status(200).json(
        new ApiResponse(200,null,"coupon deleted")
    )
})

export {applyCoupon,
    createCoupon,
    getAllCoupons,
    toggleCouponStatus,
    deleteCoupon
}