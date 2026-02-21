import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";




// get user addresses
const getUserAddresses=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("addresses")
    if (!user) {
    throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200,user.addresses,"address retrieved")
    )
})


// add address

const addAddress = asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id)

    if (!user) {
     throw new ApiError(404, "User not found");
    }
    const{
        fullName,
        phone,
        street,
        city,
        state,
        pincode,
        country,
        landmark,makeDefault
    }=req.body
    
    if (!fullName || !phone || !street || !city || !state || !pincode) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const newAddress = {
       fullName,
       phone,
       street,
       city,
       state,
       pincode,
       country,
       landmark,
       isDefault: false
    };

    // first address auto default
    if(user.addresses.length===0){
        newAddress.isDefault=true
    }

    if(makeDefault){
        user.addresses.forEach(addr=>addr.isDefault=false)
        newAddress.isDefault=true
    }
    
    user.addresses.push(newAddress)
    await user.save()
    return res.status(201).json(
        new ApiResponse(201,user.addresses,"added address successfully")
    )
})


const setDefaultAddress=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id);
    if (!user) {
       throw new ApiError(404, "User not found");
   }
    const {id}=req.params

    const address=user.addresses.id(id)

    if(!address){
        throw new ApiError(404,"address not found")
    }
    
    user.addresses.forEach(addr=>{
        addr.isDefault=addr._id.toString()===id;
    })

    await user.save();
    return res.status(200).json(
        new ApiResponse(200,user.addresses,"successfully defaulted")
    )

})


const deleteAddress=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id);
     if (!user) {
       throw new ApiError(404, "User not found");
    }
    const {id}=req.params

    const address = user.addresses.id(id);

    if(!address){
        throw new ApiError(400,"address not found")
    }

    const wasDefault=address.isDefault

    await address.deleteOne()
    
    if(wasDefault && user.addresses.length>0){
        user.addresses[0].isDefault=true
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200,user.addresses,"delete successfully")
    )
    
})
export {addAddress,
    getUserAddresses,
    setDefaultAddress,
    deleteAddress
}