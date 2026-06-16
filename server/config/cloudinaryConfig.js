
const multer=require('multer');
//Express can handle text but gets confused when it sees images
//Therefore we need multer which kind of translates the image so that our server can have it
//The file can be found in req.file

//Using Multer we will store the file in our local system
//Then we will give that file to cloudinary 
//Cloudinary will store it in their servers and will provide us a link to access the image
//As soon as the image is stored in cloudinary and we have got a link to access the file, we will delete the file from our local system
const cloudinary=require('cloudinary').v2; //.v2 means give me the version 2 API object which has the cleanest syntax and is recommended


const dotenv=require('dotenv');

const fs=require('fs');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});


//Function to upload file to cloudinary
const uploadFileToCloudinary=(file)=>{
    const options={
        resource_type:file.mimetype.startsWith('video')? 'video':'image'
    }

    return new Promise((resolve,reject)=>{
        const uploader=file.mimetype.startsWith('video')? cloudinary.uploader.upload_large:cloudinary.uploader.upload;
        uploader(file.path,options,(error,result)=>{

            //The unlink method is used to delete a file
            fs.unlink(file.path,()=>{
                if(error) reject(error);
                resolve(result);
            })
        })
    })
};


const multerMiddleware=multer({dest:'uploads/'}).single('media');


module.exports={
    uploadFileToCloudinary,
    multerMiddleware,
}