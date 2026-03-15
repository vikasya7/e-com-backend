import mongoose from "mongoose";
import { Cart } from "../models/cart.models.js";
import { Item } from "../models/item.models.js";
import { Order } from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Razorpay from "razorpay";
import { User } from "../models/user.models.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const placeOrder = asyncHandler(async (req, res) => {
   console.log("BODY:", req.body);
  const { addressId, paymentMethod = "COD" } = req.body;
  

  // ---------------- GET USER ADDRESS ----------------
  const user = await User.findById(req.user._id);

  const selectedAddress = user.addresses.id(addressId);

  if (!selectedAddress) {
    throw new ApiError(400, "Address not found");
  }

  const cart = await Cart.findOne({ owner: req.user._id });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let itemsPrice = 0;
  const orderItems = [];

  for (const cartItem of cart.items) {
    const product = await Item.findById(cartItem.itemId);

    if (!product) {
      throw new ApiError(400, "Product not found");
    }

    const variant = product.variants.find(
      v => v.weight === cartItem.weight
    );

    if (!variant || variant.stock < cartItem.quantity) {
      throw new ApiError(400, "Stock unavailable");
    }

    orderItems.push({
      itemId: product._id,
      name: product.name,
      weight: cartItem.weight,
      image: product.images?.[0]?.url,
      price: cartItem.price,
      quantity: cartItem.quantity
    });

    itemsPrice += cartItem.price * cartItem.quantity;
  }

  const taxPrice = itemsPrice * 0.18;
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    owner: req.user._id,
    orderItems,
     shippingAddress: {
      address: selectedAddress.street,
      city: selectedAddress.city,
      postalCode: selectedAddress.pincode,
      country: selectedAddress.country || "India",
      phone: selectedAddress.phone
    },

    paymentInfo: {
      method: paymentMethod,
      status: "pending"
    },
    orderStatus: "placed",
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  // ✅ If COD → reduce stock immediately
  if (paymentMethod === "COD") {
    const session=await mongoose.startSession()
    session.startTransaction()

    try {
      for(const item of orderItems){
        const result=await Item.updateOne({
          _id:item.itemId,
          "variants.weight":item.weight,
          "variants.stock":{$gte:item.quantity}
        },
      {
        $inc:{"variants.$.stock":-item.quantity}
      },{session})
      if(result.modifiedCount===0){
         throw new ApiError(400, "Stock unavailable");
      }
       await Cart.findOneAndUpdate(
      { owner: req.user._id },
      { items: [] },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
      }
    } catch (error) {
      await session.abortTransaction();
    session.endSession();
    throw error;
    }
  }

  return res.status(201).json(
    new ApiResponse(201, order, "Order created")
  );
});



// get my orders

const getMyOrders = asyncHandler(async(req,res)=>{
    const orders=await Order.find({owner:req.user._id})
    .sort({createdAt:-1})

    return res.status(200).json(
        new ApiResponse(200,orders)
    )
})


const getSingleOrder = asyncHandler(async(req,res)=>{
    const order=await Order.findOne({
        _id:req.params.id,
        owner:req.user._id
    })

    if(!order){
        throw new ApiError(400,"order not found")
    }
    return res.status(201).json(
        new ApiResponse(201,order)
    )
})


const cancelOrder = asyncHandler(async (req, res) => {

  const session = await mongoose.startSession();
  let order;

  try {

    session.startTransaction();

    order = await Order.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Idempotency
    if (order.orderStatus === "cancelled") {
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(
        new ApiResponse(200, order, "Order already cancelled")
      );
    }

    // Cancel allowed till shipped
    if (!["placed", "confirmed", "packed"].includes(order.orderStatus)) {
      throw new ApiError(400, "Order cannot be cancelled now");
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Item.updateOne(
        {
          _id: item.itemId,
          "variants.weight": item.weight
        },
        {
          $inc: { "variants.$.stock": item.quantity }
        },
        { session }
      );
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    session.endSession();
    throw error;
  }

  // 🔹 Refund OUTSIDE transaction
  if (
    order.paymentInfo.method === "RAZORPAY" &&
    order.paymentInfo.status === "paid"
  ) {

    try {

      const refund = await razorpay.payments.refund(
        order.paymentInfo.razorpayPaymentId,
        { amount: order.totalPrice * 100 }
      );

      order.paymentInfo.status = "refunded";
      order.paymentInfo.refundId = refund.id;
      order.paymentInfo.refundedAt = new Date();

      await order.save();

    } catch (err) {

      console.error("Refund failed:", err);

    }
  }

  return res.status(200).json(
    new ApiResponse(200, order, "Order cancelled successfully")
  );

});





export  {
    placeOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder
}