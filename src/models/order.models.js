import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({

  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    //index:true
  },

  orderItems: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        ref: "Item"
      },

      name: {
        type: String,
        required: true,
        trim: true
      },

      weight: {
        type: String,
        required: true
      },

      image: String,

      price: {
        type: Number,
        required: true
      },

      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ],

  paymentInfo: {
    method: {
      type: String,
      enum: ["COD", "RAZORPAY"],
      required: true
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    }
  },

  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String
  },
  shipmentInfo: {
    shipmentId: String,
    awbCode: String,
    courier: String,
    trackingUrl: String,
    shippedAt: Date
  },

  orderStatus: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled"
    ],
    default: "placed",
    //index:true
  },
   
  cancelReason: String,
  cancelledAt: Date,

  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  paidAt: Date,
  deliveredAt: Date

}, { timestamps: true });

orderSchema.index({ owner: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "paymentInfo.razorpayOrderId": 1 });


export const Order = mongoose.model("Order", orderSchema)