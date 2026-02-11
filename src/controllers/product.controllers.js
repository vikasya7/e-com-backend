import { Item } from "../models/item.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



// get all products
const getProducts=asyncHandler(async(req,res)=>{
    const products=await Item.find()
    res.json(products)
})

// add by admin
const addProduct=asyncHandler(async(req,res)=>{
     const { name, price, stock ,description} = req.body;

     const imageLocalPath = req.file?.path;
     console.log(imageLocalPath);
     
     if(!imageLocalPath){
        throw new ApiError(400,"image file is missing")
     }

     let prodImage;

     try {
        prodImage=await uploadOnCloudinary(imageLocalPath)
        console.log(prodImage);
     } catch (error) {
        console.log("Error uploading prod image", error);
        throw new ApiError(500, "failed to upload image")
     }
     
    try {
         const product=await Item.create({
            name,
            price,
            stock,
            image:prodImage.secure_url,
            description
         })
    
         res.status(200).json(
              new ApiResponse(200, product, "product successfully added")
        );
    } catch (error) {
        console.log("item creation failed");
        console.error("item ERROR 👉", error);
        if (avatar) {
            await deleteFromCloudinary(prodImage.public_id);
        }

        throw new ApiError(500, "Something went wrong while adding a product and images were deleted");
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