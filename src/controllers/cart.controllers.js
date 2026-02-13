import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Item} from "../models/item.models.js"
import { Cart } from "../models/cart.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addToCart=asyncHandler(async(req,res)=>{
    const {itemId, quantity=1}=req.body
    if(!itemId){
        throw new ApiError(400,"item id is required")
    }

    const item=await Item.findById(itemId)
    if(!item){
        throw new ApiError(400,"item not found")
    }
    let cart=await Cart.findOne({owner:req.user._id})
    if(!cart){
       cart= await Cart.create({
            owner:req.user._id,
            items:[{itemId,quantity}]
        })
    }
    const existingItem=cart.items.find(p=>p.itemId.toString()===itemId)

    if(existingItem){
        existingItem.quantity+=quantity;
    }
    else{
        cart.items.push({itemId,quantity})
    }
    await cart.save()
    
    return res.status(200).json(
        new ApiResponse(200, cart, "Item added to cart successfully")
     );

})
    


const removeFromCart=asyncHandler(async(req,res)=>{
    const {itemId,quantity=1}=req.body

    if (!itemId) {
        throw new ApiError(400, "itemId is required");
    }

    

    let cart=await Cart.findOne({owner:req.user._id})

    // if cart is not there make a cart
    if(!cart){
        throw new ApiError(400,"cart not found")
    }
    
    const intialLength=cart.items.length;

    cart.items=cart.items.filter(
        item=>item.itemId.toString()!==itemId
    )
    if(cart.items.length===intialLength){
        throw new ApiError(404,"item not present in cart")
    }

    await cart.save()

     return res.status(200).json(
       new ApiResponse(200, null, "Item removed successfully")
     );
    
})

const updateQuantity=asyncHandler(async(req,res)=>{
    const {itemId,quantity}=req.body


    if (!itemId) {
        throw new ApiError(400, "itemId is required");
    }

    if(quantity<0){
        throw new ApiError(400,"quantity can,t be negative")
    }

    const cart=await Cart.findOne({owner:req.user._id})
    if (!cart) {
        throw new ApiError(400, "cart not found");
    }

    const item=cart.items.find(
        i=>i.itemId.toString()===itemId
    )
    
    if(!item){
        throw new ApiError(400,"item not in cart")
    }
    if(quantity<=0){
        cart.items=cart.items.filter(
            i=>i.itemId.toString()!==itemId
        )
    }
    else{
        item.quantity=quantity
    }

    await cart.save()

    return res.status(200).json(
        new ApiResponse(200,cart,"quantity updated")
    )
})

const getCart=asyncHandler(async(req,res)=>{
    const cart=await Cart.findOne({owner:req.user._id})
    .populate("items.itemId","name price image stock")

    if(!cart || cart.items.length==0){
        return res.status(200).json(
            new ApiResponse(
                200,
                {items:[],bill:0},
                "cart is empty"
            )
        )
    }

    const bill =cart.items.reduce((acc,curr)=>{
        return acc+curr.itemId.price*curr.quantity
    },0)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items:cart.items,
                bill
            },
            "cart fetched successfully"
        )
    )
})


const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ owner: req.user._id });

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, { items: [], bill: 0 }, "Cart already empty")
        );
    }

    cart.items = [];
    cart.bill = 0;

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});

export {addToCart,
    removeFromCart,
    updateQuantity,
    getCart,
    clearCart
}