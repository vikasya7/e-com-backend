import { Category } from "../models/category.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const getCategories=asyncHandler(async(req,res)=>{
    try {
        const categories=await Category.find().sort({createdAt:-1})
        res.status(200).json(
            new ApiResponse(200,categories,"all categories")
        )
    } catch (error) {
        throw new ApiError(400,"something wrong while getting categories")
    }
})

// create category

const createCategory=asyncHandler(async(req,res)=>{
    try {
        const {name}=req.body
        if(!name){
            throw new ApiError(400,"name is required for category")
        }
        const exists=await Category.findOne({name})
        if(exists){
            throw new ApiError(400,"category already exists")
        }
        const category=Category.create({
            name
        })
        res.status(201).json(
            new ApiResponse(201,category,"category added")
        )
    } catch (error) {
        console.log("something wrong while adding category",error);
        
    }
})

const updateCategory=asyncHandler(async(req,res)=>{
    try {
        const category=await Category.findByIdAndUpdate(
            req.params.id,
            {name:req.body.name},
            {new:true}
        )
    
        if(!category){
            throw new ApiError(400,"category does not exist")
        }
        return res.status(201).json(
            new ApiResponse(201,"category successfully updated")
        )
    } catch (error) {
        console.log("something wrong while updating category",error);
        throw new ApiError(400,"something wrong while updating category")
    }
})


const deleteCategory=asyncHandler(async(req,res)=>{
    try {
        const category=await Category.findByIdAndDelete(req.params.id)
        return res.status(200).json(
            new ApiResponse(200,"successfully deleted category")
        )
    } catch (error) {
        console.log("something wrog while deleteing the category",error);
        throw new ApiError(400,"something wrog while deleteing the category")
    }
})

export {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}