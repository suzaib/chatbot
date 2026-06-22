const { prependOnceListener } = require("./models/converstation");
const Message = require("./models/messages");

const getMessages=async(req,res)=>{
    const userId=req.user.userId;
    const {conversationId}=req.params;

    try{
        const conversation=await Conversation.findById(conversationId);
        if(!conversation) return response(res,404,"Conversation not found");
        if(!conversation.participants.includes(userId)) return response(res,403,"Not authorized to this conversation");
        const messages=await Message.find({
            conversation:conversationId
        })
        .populate("sender","username profilePicture")
        .populate("receiver","username profilePicture")
        .sort("createdAt");

        //UpdateMany is used to update all those messages which match the given filter
        await Message.updateMany({
            //Filters
            conversation:conversationId,
            receiver:userId,
            messageStatus:{$in:["send","delivered"]}
            //send means the message has reached the user, but not yet delivered because he isn't online
        },
        {
            //What to update
            $set:{messageStatus:"read"}
        })
        conversation.unreadCount=0;
        await conversation.save();
        return response(res,200,"Message retrieved",messages);
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
}

const markAsRead=async(req,res)=>{
    const {messageIds}=req.body;
    const userId=req.user.userId;
    try{
        let message=await Message.find({
            _id:{$in:messageIds},
            receiver:userId
        })

        await Message.updateMany(
            {_id:{$in:messageIds},receiver:userId},
            {$set:{messageStatus:"read"}}
        );
        return response(res,200,"Messages marked as read", messages);
    }
}






















