const { response } = require("express");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Conversation = require("../models/converstation");

const sendMessage=async(req,res)=>{
    try{

        //Object Destructuring since req.body is an object
        const {senderId,receiverId,content,messageStatus}=req.body;
        const file=req.file;

        const participants=[senderId,receiverId].sort();
        //With sorting, conversation between A and B always show as ['A','B'] regardless of whether b sends or a sends
        //Otherwise we could have two participants arrays for same conversation as ['A','B'] and ['B','A']
        
        
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
            const uploadFile=await uploadFileToCloudinary(file);

            if(!uploadFile.secure_url) return response(res,400,"Failed to upload media");

            imageOrVideoUrl=uploadFile.secure_url;

            if(file.mimetype.startsWith("image")) contentType="image";
            else if(file.mimetype.startsWith("video")) contentType="video";
            else return response(res,400,"Unsupported file type");
        }
        
        else if(content?.trim()) contentType="text";
        else return response(res,400,"Message content is required");

        const message=new Message({
            conversation:conversation?._id,
            sender:senderId,
            receiver:receiverId,
            content,
            contentType,
            imageOrVideoUrl,
            messageStatus,
        });

        await message.save();

        if(message?.content) conversation.lastMessage=message?.id

        conversation.unreadCount+=1;
        await conversation.save();

        const populatedMsg=await Message.findById(message?._id)
        .populate("sender","username profilePicture")
        .populate("receiver","username profilePicture");
        //We first populate sender with only the username and profilePicture fields
        //Then do the same and populate the receiver

        return response(res,200,"Message sent successfully",populatedMsg);
        //We do this so that the frontend doesn't need to fetch username and profile pic again from the users, we pass that to the frontend directly

    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
}


//Get All Conversations
//To display the user's chat list
const getConversations=async(req,res)=>{
    const userId=req.user.userId;
    try{
        let conversation=await Conversation.find({

            //Find all the documents where the participants array contains the userId
            participants:userId,
        })
        .populate("participants","username profilePicture isOnline lastSeen")
        .populate({
            path:"lastMessage",
            populate:{
                path:"sender receiver",
                select:"username profilePicture"
            }
        }).sort({updatedAt:-1});//Descending sort, therefore the most recent conversation comes first

        return response(res,200,"Conversation fetched successfully",conversation);
        //The frontend needs the data to display the user's chat list
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

//Get Messages of specific conversation
//This function will be called when the user opens a chat
const getMessages=async(req,res)=>{

    //ConversationId basically tells us the two people involved in a chat
    //It is unique for each pair of people
    const {conversationId}=req.params;
    const userId=req.user.userId;

    try{

        //First we find out if such a conversation exists
        const conversation=await Conversation.findById(conversationId);
        if(!conversation) return response(res,404,"Conversation not found");

        //Only the person involved in the conversation can open the conversation and no one else
        if(!conversation.participants.includes(userId)) return response(res,403,"Not authorized to view this conversation");

        //Then we find all those messages whose conversationid is the one needed
        const messages=await Message.find({
            conversation:conversationId
        })
        .populate("sender", "username profilePicture")
        .populate("receiver", "username profilePicture")
        .sort("createdAt");

        await Message.updateMany(

            //Filter
            {
                conversation:conversationId,
                receiver:userId,
                messageStatus:{$in:["send","delivered"]}
            },

            //What to update
            {
                $set:{messageStatus:"read"}
            });

        conversation.unreadCount=0;
        await conversation.save();
        return response(res,200,"Message retrieved",messages);
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

const markAsRead=async(req,res)=>{
    const {messageIds}=req.body;
    const userId=req.user.userId;
    try{
        //Retreive relevant messages
        let message=await Message.find({
            _id:{$in:messageIds},
            receiver:userId
        })

        await Message.updateMany(
            {_id:{$in:messageIds},receiver:userId},
            {$set:{messageStatus:"read"}}
        );

        return response(res,200,"Messages marked as read",messages);
    }
    catch(errror){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

//Deleting Messages
const deleteMessage=async(req,res)=>{
    const {messageId}=req.params;
    const userId=req.user.userId;

    try{
        const msg=await Message.findById(messageId);

        //We can only delete a message if it exists
        if(!msg) return response(res,404,"Message not found");

        //Only the sender can delete his msg, he can't delete other's messages
        if(msg.sender.toString()!==userId) return response(res,403,"You do not have permission to delete this message");

        await msg.deleteOne();
        return response(res,200,"Message deleted");
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
}


module.exports={
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
    deleteMessage,
}