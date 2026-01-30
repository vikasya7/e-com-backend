import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError"



const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user=await User.findById(userId)
    
        if(!user){
            throw new ApiError(400,"not able to find user")
        }
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
    
        user.refreshToken=refreshToken
        await user.save({ validateBeforeSave: false })
    
        return {accessToken,refreshToken}
    } catch (error) {
         console.log("error while generating access and refresh token",error);
         throw new ApiError(500,"something went wrong while generating access and refresh token")
    } 
}

