import dotenv from 'dotenv'
import {app} from "./app.js"
import connectDB from './db/index.js'


dotenv.config({
    path:"./.env"
})


const port =process.env.PORT || 7000

connectDB()
.then(()=>{
    app.listen(port,()=>{
     console.log(`server is listening at port ${port}`);
    })
})
.catch((err)=>{
    console.log("mongo db connection error",err);
})