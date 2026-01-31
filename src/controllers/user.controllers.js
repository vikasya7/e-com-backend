import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(400, "not able to find user")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log("error while generating access and refresh token", error);
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, address } = req.body;


    // validation
    if ([fullname, email, password, address].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }
    const existedUser = await User.findOne(email)
    if (existedUser) {
        throw new ApiError(400, "user is already existed")
    }
    console.warn(req.files)

    const avatarLocalPath = req.files?.avatar?.[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }


    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log(avatar);
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "failed to upload avatar")
    }
    try {
        const user = await User.create({
            fullname: fullname,
            email,
            password,
            avatar: avatar.url,
            address,
        })

        const createdUser = User.findById(user._id).select("-password -refreshToken")
        if (!createdUser) {
            throw new ApiError(400, "something went wrong while registering a user")
        }

        return res.status(201).
            json(new ApiResponse(200, "user registered successfully"))
    }

    catch (error) {
        console.log("User creation failed");
        console.error("REGISTER ERROR 👉", error);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }

        throw new ApiError(500, "Something went wrong while registering a user and images were deleted");
    }
})




export {
    generateAccessTokenAndRefreshToken,
    registerUser
}