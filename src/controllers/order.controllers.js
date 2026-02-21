import { Cart } from "../models/cart.models.js";
import { Item } from "../models/item.models.js";
import { Order } from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const placeOrder = asyncHandler(async (req, res) => {

  const {
    address,
    city,
    postalCode,
    country,
    phone,
    paymentMethod = "COD"
  } = req.body;

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
      address,
      city,
      postalCode,
      country,
      phone
    },
    paymentInfo: {
      method: paymentMethod,
      status: paymentMethod === "COD" ? "paid" : "pending"
    },
    orderStatus: paymentMethod === "COD" ? "placed" : "pending",
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  // ✅ If COD → reduce stock immediately
  if (paymentMethod === "COD") {
    for (const item of order.orderItems) {
      await Item.updateOne(
        {
          _id: item.itemId,
          "variants.weight": item.weight,
          "variants.stock": { $gte: item.quantity }
        },
        {
          $inc: { "variants.$.stock": -item.quantity }
        }
      );
    }

    await Cart.findOneAndUpdate(
      { owner: req.user._id },
      { items: [] }
    );
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

  const order = await Order.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus !== "placed") {
    throw new ApiError(400, "Order cannot be cancelled now");
  }

  // 🔥 Restore variant stock
  for (const item of order.orderItems) {

    const product = await Item.findById(item.itemId);

    if (!product) continue;

    const variant = product.variants.find(
      v => v.weight === item.weight
    );

    if (variant) {
      variant.stock += item.quantity;
      await product.save();
    }
  }

  order.orderStatus = "cancelled";
  await order.save();

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