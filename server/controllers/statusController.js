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
        const statuses=await Status.find({
            expiresAt:{$gt:new Date()}
        })
        .populate("user","username profilePicture")
        .populate("viewers","username profilePicture").sort({createdAt:-1});

        return response(res,200,"Statuses retreived successfully",statuses)
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

const viewStatus=async(req,res)=>{
    const {statusId}=req.params;
    const userId=req.user.userId;
    try{
        const isStatus=await Status.findById(statusId);

        //If status does not exists
        if(!isStatus) return response(res,404,"Status not found");

        //Only add if the status isn't already viewed
        if(!status.viewers.include(userId)){
            status.viewers.push(userId);
            await status.save();

            const updatedStatus=await Status.findById(statusId)
            .populate("user","username profilePicture")
            .populate("viewers","username profilePicture")
        }
        else console.log("User already viewed the status");

        return response(res,200,"Status viewed successfully");
        else

    }
}

