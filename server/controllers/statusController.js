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

        //Emit socket event
        if(req.io && req.socketUserMap){
            //Broadcast to all connecting user except creator
            for(const [connectedUserId,socketId] of req.socketUserMap){
                if(connectedUserId!==userId) req.io.to(socketId).emit("new_status",populatedStatus);
            }
        }

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

            //Notify the owner that a user has viewed their status with the new view count
            if(req.io && req.socketUserMap){
                //Broadcast to all connecting users except the creator
                const statusOwnerSocketId=req.socketUserMap.get(status.user?._id.toString());
                if(statusOwnerSocketId){
                    const viewData={
                        statusId,
                        viewerId:userId,
                        totalViewers:updateStatus.viewers.length,
                        viewers:updateStatus.viewers
                    }

                    res.io.to(statusOwnerSocketId).emit("status_viewed",viewedData);
                }
            }
            else console.log("Status owner not connected");
        }

        return response(res,200,"Status viewed successfully");
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};


//Deleting the status
//This will be triggered when we delete a status
const deleteStatus=async(req,res)=>{
    const {statusId}=req.params;
    const userId=req.user.userId;
    try{
        const status=await Status.findById(statusId);

        //We can't delete a status that doesn't exists
        if(!status) return response(res,404,"Status not found");

        //A user can only delete his own status
        if(status.user.toString()!==userId) return response(res,403,"You don't have permission to delete other's status");

        //Deleting the status
        await status.deleteOne();

        //Notify other's that the user has deleted his status
        if(req.io && req.socketUserMap){
            for(const [connectedUserId,socketId] of req.socketUserMap){
                if(connectedUserId!==userId){
                    req.io.to(socketId).emit("status_deleted",statusId);
                }
            }
        }
        return response(res,200,"Status deleted");
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
}

module.exports={
    createStatus,
    getStatus,
    viewStatus,
    deleteStatus
}

