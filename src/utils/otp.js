import crypto from 'crypto'

export const generateOTP=()=>{
    return Math.floor(100000+Math.random()*900000).toString()
}
export const hashOtp=(otp)=>{
   return crypto.createHash("sha256").update(otp).digest("hex");
}