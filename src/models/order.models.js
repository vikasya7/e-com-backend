import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
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
            image: {
                type: String
            },
            price: {
                type: Number
            },
            quantity: {
                type: Number,
                default: 1
            },
        }
    ],



    paymentInfo: {
        method: {
            type: String,
            enum: ["COD", "CARD", "UPI", "PAYPAL"]
        },
        transactionId: String,
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
        default: "placed"
    },

    // pricing
    itemsPrice: Number,
    taxPrice: Number,
    shippingPrice: Number,
    totalPrice: Number,

    paidAt: Date,
    deliveredAt: Date

}, { timestamps: true })



orderSchema.index({ owner: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema)