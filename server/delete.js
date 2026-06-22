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


        await Message.updateMany(
            {
                conversation:conversationId,
                receiver:userId,
                messageStatus:{$in:["send","delivered"]}
            },
            {
                $set:{messageStatus:"read"}
            }
        )

        conversation.unreadCount=0;
        await conversation.save();
        return response(res,200,"Message retrieved",messages);
    }
}