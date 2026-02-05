import { Cart } from "../models/cart.models.js";
import { Item } from "../models/item.models.js";
import { Order } from "../models/order.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const placeOrder=asyncHandler(async(req ,res)=>{
    const{address,
        city,
        postalCode,
        country,
        phone,paymentMethod="COD"
    }=req.body

    const cart=await Cart.findOne({owner:req.user._id})

    if(!cart || cart.items.length===0){
        throw new ApiError(400,"cart not found")
    }


    // stock validation and prepare items

    let itemsPrice=0
    const orderItems=[]
    for(const cartItem of cart.items){
        const item=await Item.findById(cartItem.itemId)
        if(!item){
            throw new ApiError(400,"item not found")
        }

        if(item.stock<cartItem.quantity){
            throw new ApiError(400,`${item.name} is out of stock`)
        }

        // reduce stock
        item.stock-=cartItem.quantity
        await item.save();

        orderItems.push({
            itemId:item._id,
            name:item.name,
            image:item.image,
            price: item.price,
            quantity: cartItem.quantity
        })


        itemsPrice += item.price * cartItem.quantity;
    }

    // pricing
    const taxPrice=itemsPrice*0.18   //gst
    const shippingPrice=itemsPrice>500 ? 0:50
    const totalPrice=itemsPrice+taxPrice+shippingPrice


    // now we will create order
    const order=await Order.create({
        owner:req.user._id,
        orderItems,
        shippingAddress:{
            address,
            city,
            postalCode,
            country,
            phone
        },
        paymentInfo:{
            method:paymentMethod,
            status:paymentMethod==='COD'? 'pending':'paid'
        },
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    });


    // clear cart
    cart.items=[];
    cart.bill=0
    await cart.save();


    // response

    return res.status(201).json(
        new ApiResponse(201,"order placed successfully")
    )
})


// get my orders

const getMyOrders = asyncHandler(async(req,res)=>{
    const orders=await Order.find({owner:req.user._id})
    .sort({createdAt:-1})

    return res.status(200).json(
        new ApiResponse(200,orders)
    )
})


const getSingleOrder = asyncHandler(async(req,res)=>{
    const order=await Order.findOne({
        _id:req.params.id,
        owner:req.user._id
    })

    if(!order){
        throw new ApiError(400,"order not found")
    }
    return res.status(201).json(
        new ApiResponse(201,order)
    )
})

const cancelOrder=asyncHandler(async(req,res)=>{
    const order=await Order.findOne({
        _id:req.params._id,
        owner:req.user._id
    })
    
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    if(order.orderStatus!=='placed'){
        throw new ApiError(400,"order cannot be placed now")
    }
    order.orderStatus='cancelled'

    // restore stock
    for(const item of order.orderItems){
        await Item.findByIdAndUpdate(item.itemId,{
                $inc: { stock: item.quantity }
        })
    }

     await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled")
    );
})


export  {
    placeOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder
}