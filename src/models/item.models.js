import mongoose, { Schema } from "mongoose";


const itemSchema = new Schema({
    owner:{
      type: Schema.Types.ObjectId,
      ref:"User"
    },
    name:{
        type:String,
        required: true,
        trim: true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    review: {
        type:String
    },
    stock: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
},{timestamps:true})


export const Item=mongoose.model("Product",itemSchema)