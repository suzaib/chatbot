const message=new MessageChannel({
    conversation:conversationId,
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

const populatedMsg=await Message.findOne(message?.id)
.populate("sender","username profilePicture")
.populate("receiver","username profilePicture");

return response(res,200,"Message sent successfully",populatedMsg);