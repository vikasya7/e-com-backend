import { Item } from "../models/item.models.js";
import { Order } from "../models/order.models.js";
import { User } from "../models/user.models.js";
import { createShipment } from "../services/shiprocket.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAdminStats = asyncHandler(async (req, res) => {
  try {
    const totalProducts = await Item.countDocuments();

    const totalStock = await Item.aggregate([
      {$unwind:"$variants"},
      {
        $group:{
          _id:null,
          total:{$sum:"$variants.stock"}
        }
      }
    ]);
    const lowStock = await Item.aggregate([
      {$unwind:"$variants"},
      {
        $match:{
          "variants.stock":{$lt:5}
        }
      },
      {
        $count:"lowStock"
      }
    ])
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: "$totalPrice" }
    }
  }
]);
     
    res.json({
      totalProducts,
      totalStock: totalStock[0]?.total || 0,
      lowStock: lowStock[0]?.lowStock || 0,
      totalOrders,
      revenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    console.log("error while sendin admin dashboard details", error);

    throw new ApiError(400, "problem while sending admin dashboard details");
  }
});

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

  res.status(200).json(new ApiResponse(200, "user promoted successfully"));
});

const confirmOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(400, "Order not found");
  }

  if (order.orderStatus !== "placed") {
    throw new ApiError(400, "Order cannot be confirmed");
  }

  order.orderStatus = "confirmed";

  await order.save();

  res.status(200).json(new ApiResponse(200, "Order confirmed"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("owner", "fullname email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const packOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "owner",
    "fullname email",
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus !== "confirmed") {
    throw new ApiError(400, "Order must be confirmed first");
  }

  if (order.shipmentInfo?.awbCode) {
    throw new ApiError(400, "Shipment already created");
  }

  const shipment = await createShipment(order);
  order.shipmentInfo = {
    shipmentId: shipment.shipmentId,
    awbCode: shipment.awbCode,
    courier: shipment.courier,
    trackingUrl: `https://shiprocket.co/tracking/${shipment.awbCode}`,
    shippedAt: new Date(),
  };
  order.orderStatus = "shipped";

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Shipment created successfully"));
  console.log("SHIPROCKET RESPONSE:", shipment);
});

const getProductStocks = asyncHandler(async (req, res) => {
  try {
    const products = await Item.find().select("name variants");

    res.json(products);
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Error fetching product stock");
  }
});

const updateVariantStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { weight, quantity } = req.body;

  console.log("Product ID:", productId);
  console.log("Weight:", weight);
  console.log("Quantity:", quantity);

  const product = await Item.findById(productId);

  if (!product) {
    console.log("Product not found in DB");
    throw new ApiError(404, "Product not found");
  }

  const variant = product.variants.find((v) => v.weight === weight);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  variant.stock += Number(quantity);

  await product.save();

  res.json({ message: "Stock updated", product });
});

export { getAdminStats, 
  promoteByEmail, 
  confirmOrder, 
  getAllOrders, 
  packOrder,
  getProductStocks ,
  updateVariantStock
};
