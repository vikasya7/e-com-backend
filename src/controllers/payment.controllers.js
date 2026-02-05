import Razorpay from "razorpay";
import crypto from "crypto"
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";





const razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET
})


const createPaymentOrder=asyncHandler(async(req ,res)=>{
    const {orderId} =req.body
    const order=await Order.findById(orderId)

    if(!order){
        throw new ApiError(400,"order not found")
    }

    if(order.paymentInfo.status==="paid"){
         throw new ApiError(400, "Already paid");
    }
    const options={
        amount:Math.round(order.totalPrice * 100),
        currency:"INR",
        receipt:order._id.toString()
    }

    const razorpayOrder = await razorpay.orders.create(options)
    return res.status(200).json(
        new ApiResponse(200,razorpayOrder)
    )
})

const verifyPayment= asyncHandler(async(req,res)=>{
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    }=req.body;

    const body=razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature= crypto
    .createHmac("sha256",process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex")

    if(expectedSignature!==razorpay_signature){
        throw new ApiError(400,"Payment verification failed")
    }

    // mark order paid

    const order=await Order.findById(razorpay_order_id)
    
    if (!order) {
         throw new ApiError(404, "Order not found");
    }
    order.paymentInfo.status="paid"
    order.paymentInfo.transactionId=razorpay_payment_id
    order.paidAt=Date.now()

    await order.save();

    return res.status(200).json(
        new ApiResponse(200,order,"Payment successfull")
    )
})



export {
    createPaymentOrder,
    verifyPayment
}