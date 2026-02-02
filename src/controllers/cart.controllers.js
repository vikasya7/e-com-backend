import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/ApiError.js"
import {Item} from "../models/item.models.js"
import { Cart } from "../models/cart.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addToCart=asyncHandler(async(req ,res)=>{
    const {itemId,quantity=1}=req.body

    if(!itemId){
        throw new apiError(400,"itemId is required")
    }

    // check item
    const item = await Item.findById(itemId);

    if(!item){
        throw new apiError(400,"item not found")
    }
    
    let cart=await Cart.findOne({owner: req.user._id});

    if(!cart){
        cart=await Cart.create({
            owner:req.user._id,
            items:[],
            bill:0
        })
    }

    const existingIndex=cart.items.findIndex(p=>p.itemId.toString()===itemId)

    if(existingIndex>-1){
        // items are there in the cart
        let existingItem=cart.items[existingIndex];
        existingItem.quantity+=quantity;
        cart.items[existingIndex]=existingItem
    }
    else{
        cart.items.push({itemId,
            name: item.name,      // good you kept this
            quantity,
            price: item.price})
    }

    // total price
     cart.bill = cart.items.reduce(
        (acc, curr) => acc + curr.price * curr.quantity,
        0
    );


    await cart.save();
    
     return res.status(200).json(
        new ApiResponse(200, cart, "Item added to cart successfully")
    );
})