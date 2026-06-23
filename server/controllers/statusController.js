const Status = require("../models/status");

//This function will get triggered when the user will post a status
const createStatus=async(req,res)=>{
    try{
        const {content,contentType}=req.body;
        const userId=req.user.userId;
        const file=req.file;

        let mediaUrl=null;
        let finalContentType=contentType || 'text';

        //Handle file upload
        if(file){
            const uploadFile=await uploadFileToCloudinary(file);
            if(!uploadFile.secure_url) return response(res,400,"Failed to upload media");

            mediaUrl=uploadFile.secure_url;

            //Setting the content type
            if(file.mimetype.startsWith('image')) finalContentType="image";
            else if(file.mimetype.startsWith('video')) finalContentType="video";
            else return response(res,400,"Unsupported file type");
        }
        else if(content?.trim()) finalContentType="text";
        //Trim helps us eliminate empty m
        else return response(res,400,"Status content is required");

        const expiresAt=new Date(Date.now()+24*60*60*1000);

        const status=new Status({
            user:userId,
            content=mediaUrl || content,
            contentType:finalContentType,
            expiresAt
        });

        await status.save();

        const populatedStatus=await Status.findById(status?._id)
        .populate("user","username profilePicture")
        .populate("viewer","username profilePicture")

        return response(res,201,"Status created successfully",populatedStatus);
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

const getStatus=async(req,res)=>{
    try{
        const status=await Status.find({
            expiresAt:{$gt:new Date()}
        })
    }
}

