import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
const app=express()



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// common middlewares
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// import routes
import userRouter from './routes/user.routes.js'
import cartRouter from './routes/cart.routes.js'
import orderRouter from './routes/order.routes.js'
import paymentRouter from './routes/payment.routes.js'
import productRouter from './routes/product.routes.js'


app.use("/api/v1/users",userRouter)
app.use("/api/v1/users",cartRouter)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/products",productRouter)

export {app}