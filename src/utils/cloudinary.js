import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})


const uploadOnCloudinary =async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(
            localFilePath, {
                resource_type:"auto"
            }
        )
        console.log("File uploaded on cloudinary,File src:",+response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("Error on cloudinary",error);
        fs.unlinkSync(localFilePath)
        return null
    }
}


const deleteFromCloudinary = async (publicId) =>{
    try {
        const result=await cloudinary.uploader.destroy(publicId)
        console.log("deleted from cloudinary publicId:",publicId);
        
    } catch (error) {
        console.log("error deleting from cloudinary",error);
        return null;
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}