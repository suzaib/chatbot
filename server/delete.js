//in statusController, there are many populate statements which include viewers, but some of them might not be needed


Socket.on("get_user_status",(requestedUserId,callback)=>{
    const isOnline=onlineUsers.has(requestedUserId);
    callback({
        userId:requestedUserId,
        isOnline,
        lastSeen:isOnline? newDate():null;
    })
})

Socket.on("send_message",async(message)=>{
    try{
        const receiverSocketId=onlineUsers.get(message.receiver?._id);
        if(receiverSocketId) io.to(receiverSocketId).emit("received_message");

    }

    catch(error){
        console.error()
    }
})

socket.on("message_read",async({messageIds,senderId})=>{
    try{
        await Message.updateMany(
            {_id:{$in:messageIds}},
            {$set:{messageStatus:"read"}}
        )

        const senderSocketId=onlineUsers.get(senderId);
        if(senderSocketId){
            messageIds.forEach((messageId)=>{
                io.to(senderSocketId).emit("message_status_update",{
                    messageId,
                    messageSTatus:"read"
                })
            })
        }
    }
})
