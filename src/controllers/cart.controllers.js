import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Item} from "../models/item.models.js"
import { Cart } from "../models/cart.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addToCart=asyncHandler(async(req ,res)=>{
    const {itemId,quantity=1}=req.body
    console.log("BODY:", req.body);
    if(!itemId){
        throw new ApiError(400,"itemId is required")
    }

    // check item
    const item = await Item.findById(itemId);

    if(!item){
        throw new ApiError(400,"item not found")
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



const removeFromCart=asyncHandler(async(req,res)=>{
    const {itemId,quantity=1}=req.body

    if (!itemId) {
        throw new ApiError(400, "itemId is required");
    }

    

    let cart=await Cart.findOne({owner:req.user._id})

    // if cart is not there make a cart
    if(!cart){
        cart=await Cart.create({
            owner:req.user._id,
            items:[],
            bill:0
        })
    }

    // check if there are items in the cart
    const existingIndex=cart.items.findIndex(p=>p.itemId.toString()===itemId)

    if(existingIndex===-1){
        throw new ApiError(400,"item not present in cart")
    }
    const existingItem=cart.items[existingIndex]

    if(existingItem.quantity<=quantity){
        cart.items.splice(existingIndex,1)
    }
    else{
        existingItem.quantity-=quantity
    }

    // cart total bill
    cart.bill = cart.items.reduce(
        (acc, curr) => acc + curr.price * curr.quantity,
        0
    );

    await cart.save()

    return res.status(200).
    json(new ApiResponse(200,"items removed from cart successfully"))
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

    const existingIndex=cart.items.findIndex(p=>p.itemId.toString()===itemId)
    if (existingIndex === -1) {
        throw new ApiError(400, "item not present in cart");
    }
    if (quantity === 0) {
        cart.items.splice(existingIndex, 1);
    } else {
        cart.items[existingIndex].quantity = quantity;
    }
    cart.bill=cart.items.reduce(
        (acc,curr)=>acc+curr.price*curr.quantity,0
    )


    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Quantity updated successfully")
    );

})

const getCart=asyncHandler(async(req,res)=>{
    const cart=await Cart.findOne({owner:req.user._id})

    if(!cart){
        
        return res.status(200).json(
             new ApiResponse(
                200,
                { items: [], bill: 0 },
                "Cart is empty"
            )
        )
    }
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
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