import mongoose, { Schema } from "mongoose";


const otpSchema=new Schema({
    phone: {
        type:String,
        required:true,
        index:true
    },

    otpHash: {
        type:String,
        required:true
    },

    expiresAt:{
        type: Date,
        required:true,
        index: {expires:0}
    },
    attempts: {
        type:Number,
        default:0
    }
},{timestamps:true})

export const OTP=mongoose.model("OTP",otpSchema)