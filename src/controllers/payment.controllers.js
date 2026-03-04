import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Item } from "../models/item.models.js";
import mongoose from "mongoose";
import { Cart } from "../models/cart.models.js";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(400, "order not found");
  }

  if (order.paymentInfo.status === "paid") {
    throw new ApiError(400, "Already paid");
  }
  const options = {
    amount: Math.floor(order.totalPrice * 100),
    currency: "INR",
    receipt: order._id.toString(),
  };

  const razorpayOrder = await razorpay.orders.create(options);
  order.paymentInfo.razorpayOrderId = razorpayOrder.id;
  await order.save();
  return res.status(200).json(new ApiResponse(200, razorpayOrder));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Invalid payment data");
  }
  // Signature verification
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  // start mongodb transaction
  const session=await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      "paymentInfo.razorpayOrderId": razorpay_order_id,
    }).session(session);
  
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    // idempotancy check 
    if (order.paymentInfo.status === "paid") {
      await session.commitTransaction()
      session.endSession()
      return res
        .status(200)
        .json(new ApiResponse(200, order, "Already processed"));
    }
  
    // atmoic update
    for (const item of order.orderItems) {
      const result = await Item.updateOne(
        {
          _id: item.itemId,
          "variants.weight": item.weight,
          "variants.stock": { $gte: item.quantity },
        },
        {
          $inc: { "variants.$.stock": -item.quantity },
        },
      );
  
      if (result.modifiedCount === 0) {
        throw new ApiError(400, "Stock unavailable");
      }
    }

    // update order
    order.paymentInfo.status = "paid";
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    order.orderStatus = "placed";
  
    await order.save({session});
  
     // clear cart
      await Cart.findOneAndUpdate(
      { owner: order.owner },
      { items: [] },
      {session}
    );
    // commit everything
    await session.commitTransaction();
    session.endSession();
  
    return res.status(200).json(
      new ApiResponse(200, order, "Payment successful")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error
  }
});

export { createPaymentOrder, verifyPayment };
