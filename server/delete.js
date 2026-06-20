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