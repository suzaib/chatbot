const { response } = require("express");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Conversation = require("../models/converstation");

const sendMessage=async(req,res)=>{
    try{

        //Object Destructuring since req.body is an object
        const {senderId,receiverId,content,messageStatus}=req.body;
        const file=req.file;

        const participants=[senderId,receiverId].sort();
        
        //Check if conversation already exists
        let conversation=await Conversation.findOne({
            participants:participants
        });

        //If no previous conversation exists, create a new one
        if(!conversation){
            conversation=new Conversation({
                participants,
                //We don't need unreadCount because it is 0 by default
            });

            await conversation.save();
        }

        let imageOrVideoUrl=null;
        let contentType=null;

        //Handle file upload
        if(file){
            const uploadFile=uploadFileToCloudinary(file);

            if(uploadFile.secure_url) return response(res,400,"Failed to upload media");

            imageOrVideoUrl=uploadFile.secure_url;

            if(file.mimetype.startsWith("image")){
                contentType:"image"
            }
            else if(file.mimetype.startsWith("video")){
                contentType:"video"
            }
            else return response(res,400,"Unsupported file type");
        }
        else if(content?.trim()){
            contentType:"text";
        }
        else return response(res,400,"Message content is required");

        const newMessage=
    }
}