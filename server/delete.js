const multer=require('multer');

const cloudinary=require('cloudinary');
const dotenv=require('dotenv');
const fs=require('fs');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});


const uploadFileToCloudinary=(file)=>{
    const options={
        resource_type:file.mimetype.startWith('video')? 'video':'image'
    }

    return new Promise((resolve,reject)=>{
        const uploader=file.mimetype.startWith('video')? cloudinary.uploader.upload_large:cloudinary.uploader.upload
        uploader(file.path,options,(error,result)=>{
            fs.unlink(file,path,()=>{
                fs.unlink(file.path,()=>{
                    if(error) reject(error);
                    resolve (result);
                })
            })
        })
    })
}