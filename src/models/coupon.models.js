import mongoose, { Schema } from "mongoose";



const couponSchema=new Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    discountType:{
        type:String,
        enum:["percentage","flat"],
        required:true,
    },
    discountValue:{
        type:Number,
        required:true
    },
    minOrderAmount:{
        type:Number,
        default:0
    },
    expiresAt:Date,
    active:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


export const Coupon=mongoose.model("Coupon",couponSchema)