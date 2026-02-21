import { json } from "express";
import { Item } from "../models/item.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

// get single product

const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Item.findById(req.params.id);
  console.log("ID RECEIVED:", req.params.id);
  console.log("GET SINGLE PRODUCT CONTROLLER HIT");
  if (!product) {
    throw new ApiError(404, "product not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// get all products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Item.find();
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// add by admin
const addProduct = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body;

  // Parse variants (stringified from frontend)
  let variants;
    try {
    variants = JSON.parse(req.body.variants);
  } catch (error) {
    throw new ApiError(400, "Invalid variants format");
  }


  if (!variants || variants.length === 0) {
    throw new ApiError(400, "At least one variant is required");
  }

  // multiple images
  const imageFiles = req.files;

  if (!imageFiles || imageFiles.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  let uploadedImages = [];

  try {
    // upload all images to cloudinary

    for (const file of imageFiles) {
      const uploaded = await uploadOnCloudinary(file?.path);
      uploadedImages.push({
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      });
    }

    const product = await Item.create({
      name,
      description,
      category,
      images: uploadedImages,
      variants,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product added successfully"));
  } catch (error) {
    console.error("Product creation failed:", error);
    for(const image of uploadedImages){
        await deleteFromCloudinary(image.public_id)
    }
    throw new ApiError(500, "Something went wrong while adding product");
  }
});

// delete
const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Item.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  try {

    // Delete all images from Cloudinary
    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }

    // Delete product from DB
    await product.deleteOne();

    return res.status(200).json(
      new ApiResponse(200, null, "Product deleted successfully")
    );

  } catch (error) {
    console.error("Delete error:", error);
    throw new ApiError(500, "Error deleting product");
  }

});

// update

const updateProduct = asyncHandler(async (req, res) => {

  const product=await Item.findById(req.params.id)

  if(!product){
    throw new ApiError(404,"Product not found")
  }
  const { name, description, category } = req.body;
  // ✅ Update basic fields properly
  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (req.body.variants) {
    try {
      product.variants = JSON.parse(req.body.variants);
    } catch {
      throw new ApiError(400, "Invalid variants format");
    }
  }

  let removedImages = [];
  if(req.body.removedImages){
    const removedImages=JSON.parse(req.body.removedImages)

    for(const public_id of removedImages){
      await deleteFromCloudinary(public_id)
    }

    product.images=product.images.filter(
      img=>!removedImages.includes(img.public_id)
    )
  }

  // add new images

  if(req.files && req.files.length>0){
    const newImages=await Promise.all(
      req.files.map(async (file)=>{
        const uploaded=await uploadOnCloudinary(file.path)
        return {
          url: uploaded.secure_url,
          public_id: uploaded.public_id
        };
      })
    )
    product.images.push(...newImages)
  }

 if (product.images.length === 0) {
    throw new ApiError(400, "Product must have at least one image");
  }

  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product, "Product updated successfully")
  );
})

export {
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
};
