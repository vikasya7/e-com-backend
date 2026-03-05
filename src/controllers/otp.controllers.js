import { OTP } from "../models/otp.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateOTP, hashOtp } from "../utils/otp.js";
import { sendSMS } from "../utils/sendSMS.js";


export const sendOtp= async(req,res)=>{
    try {
        const {phone}=req.body;

        if(!phone){
            throw new ApiError(400,"Phone number required")
        }

        const otp=generateOTP();
        const otpHash=hashOtp(otp);

        await OTP.create({
            phone,
            otpHash,
            expiresAt: Date.now()+5*60*1000
        });

        await sendSMS(phone,otp);

        res.status(200).json(
            new ApiResponse(200,"OTP sent successfully")
        )
    } catch (error) {
        console.log(error);
        throw new ApiError(400,"Failed to send otp")
    }
}

export const verifyOtp=async(req,res)=>{
    const { phone, otp } = req.body;

    const record = await OTP.findOne({ phone }).sort({ createdAt: -1 });
    if(!record){
        throw new ApiError(400,"OTP expired")
    }

    const otpHash=hashOtp(otp);
    if(otpHash!==record.otpHash){
        throw new ApiError(400,"Invalid OTP")
    }

    await OTP.deleteOne({_id:record._id})

    return res.status(200).json(
        new ApiResponse(200,"Phone verified")
    )
}