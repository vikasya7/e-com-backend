import { Item } from "../models/item.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



// get all products
const getProducts=asyncHandler(async(req,res)=>{
    const products=await Item.find()
    res.status(200).json(
        new ApiResponse(200,products,"all products")
    )
})

// add by admin
const addProduct=asyncHandler(async(req,res)=>{
    try {
        const product = await Item.create(req.body)
       res.status(200).json(
            new ApiResponse(200,product,"product successfully added")
        )
    } catch (error) {
        console.log("error in adding product",error);
       throw new ApiError(400,"product not added")
    }
})

// delete
const deleteProduct=asyncHandler(async(req,res)=>{
    try {
        await Item.findByIdAndDelete(req.params.id)
        res.status(200).json(
            new ApiResponse(200,"product deleted successfully")
        )
    } catch (error) {
       throw new ApiError(400,"something wrong while deleting the product")
    }
})


// update

const updateProduct=asyncHandler(async(req,res)=>{
    const updates=await Item.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.status(200).json(
        new ApiResponse(200,updates,"product updated successfully")
    )
})

export {getProducts,
    addProduct,
    deleteProduct,
    updateProduct
}