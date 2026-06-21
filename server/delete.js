const getConversations=async(req,res)=>{
    const userId=req.user.userId;
    try{
        let conversation=await Conversation.find({
            participants:userId, //This finds all the conversation where the user is a participant
        })
        .populate("participants","username profilePicture isOnline lastSeen")
        .populate({
            path:"lastMessage",
            populate:{
                path:"sender receiver",
                select:"username profilePicture"
            }
        }).sort({updatedAt:-1});

        return response(res,200,"Conversation fetched successfully",conversation);


    }
}