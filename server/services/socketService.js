const {Server}=require('socket.io');
const User=require("../models/user");
const Message=require("../models/message")


//We need all the users who are online
//It has the mapping : userId --> socketId
const onlineUsers=new Map();

//We need a list of users who are currently typing
const typingUsers=new Map();

const initializeSocket=(server)=>{
    const io=new Server(server,{ //Creating a socket.io server, The Second argument is the configuration settings for the server
        cors:{
            origin:process.env.FRONTEND_URL, //Allow requests from this origin
            credentials:true, //Credentials like cookies etc can be sent over cross origin requests
            method:['GET','PUT','DELETE','POST','OPTIONS'] //These methods are allowed for cross origin requests
        },
        pingTimeout:60*1000 //Disconnecting inactive users/sockets after 60s
    })

    //When a new client connects, socket.io creates a new socket object
    io.on('connection',(socket)=>{
        let userId=null;

        //Handle user connection and mark them online in db
        //The event will be triggered by the frontend
        socket.on("user_connected",async(connectingUserId)=>{ //on waits for the event named user_connected to be triggered
            try{
                userId=connectingUserId;
                onlineUsers.set(userId,socket.id);
                socket.join(userId);

                //Updating backend
                await User.findByIdAndUpdate(userId,{
                    isOnline:true,
                    lastSeen:new Date(),
                });

                //Notify all users that this user is now online
                //This will be listened by the frontend
                io.emit("user_status",{userId,isOnline:true}); //emit is used to trigger the event
            }
            catch(error){
                console.error("Error handling user connection",error);
            }
        })

        //Return online status of requested users
        socket.on("get_user_status",(requestedUserId,callback)=>{
            const isOnline=onlineUsers.has(requestedUserId);
            callback({
                userId:requestedUserId,
                isOnline,
                lastSeen:isOnline? newDate():null
            })
        })

        //Forward message to receiver if online
        socket.on("send_message",async(message)=>{
            try{
                const receiverSocketId=onlineUsers.get(message.receiver?._id);
                if(receiverSocketId) io.to(receiverSocketId).emit("received_message");
            }
            catch(error){
                console.error("Error sending message",error);
                socket.emit("message_error",{error:"Failed to send message"});
            }
        })

        //Update messages and notify the sender
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
                            messageStatus:"read"
                        })
                    })
                }
            }
            catch(error){
                console.error("Error updating message read status",error); 
            }
        })

        //Handle typing start event and stop after 3s
        socket.on("typing_start",({conversationId,receiverId})=>{
            if(!userId || !conversationId || !receiverId) return;

            if(!typingUsers.has(userId)) typingUsers.set(userId,{});

            const userTyping=typingUsers.get(userId);
            userTyping[conversationId]=true;

            //Clear any exiting timeout
            if(userTyping[`${conversationId}_timeout`]) clearTimeout(userTyping[`${conversationId}_timeout`]);

            //Create new interval that stops the timeout after 3s
            userTyping[`${conversationId}_timeout`]=setTimeout(()=>{
                userTyping[conversationId]=false;
                socket.to(receiverId).emit("user_typing",{
                    userId,
                    conversationId,
                    isTyping:false,
                })
            },3000)

            //Notify the receiver
            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping:true
            })
        })


        socket.on("typing_stop",({conversationId,receiverId})=>{
            if(!userId || !conversationId || !receiverId) return;

            if(typingUsers.has(userId)){
                const userTyping=typingUsers.get(userId);
                userTyping[conversationId]=false;

                if(userTyping[`${conversationId}_timeout`]){
                    clearTimeout(userTyping[`${conversationId}_timeout`]);
                    delete userTyping[`${conversationId}_timeout`];
                }
            }

            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping:false
            })
        })

        //Add or update reactions on a message
        socket.on("add_reactions",async({messageId,emoji,userId,reactionUserId})=>{
            try{
                const message=await Message.findById(messageId);
                if(!message) return;

                const existingReactionIdx=message.reactions.findIndex((r)=>{
                    r.user.toString()===reactionUserId;
                })

                //If the message already has a reaction(emoji)
                if(existingReactionIdx==-1){
                    const existingReaction=message.reaction.find(existingReactionIdx);

                    //If the emoji is the same as the one we are putting, then toggle remove it
                    if(existing.emoji===emoji) message.reactions.splice(existingReactionIdx,1);
                    else message.reactions[existingReactionIdx].emoji=emoji;
                }

                //We add a new reaction
                else message.reactions.push({user:reactionUserId,emoji});

                await message.save();

                const populatedMessage=await Message.findById(message?._id)
                .populate("sender","username profilePicture")
                .populate("receiver","username profilePicture")
                .populate("reactions.user","username")

                const updatedReactions={
                    messageId,
                    reactions:populatedMessage.reactions
                }

                const senderSocket=onlineUsers.get(populatedMessage.sender?._id.toString());
                const receiverSocket=onlineUsers.get(populatedMessage.reciever?._id.toString());

                if(senderSocket) io.to(senderSocket).emit("reaction_update",reactionUpdated);
                if(receiverSocket) io.to(receiverSocket).emit("reaction_update",reactionUpdate);
            }
            catch(error){
                console.error("Error handling reactions",error);
            }
        })

        const handleDisconnected=async()=>{
            if(!userId) return;

            try{
                onlineUsers.delete(userId);

                //Clear all typing timeouts
                if(typingUsers.has(userId)){
                    const userTyping=typingUsers.get(userId);
                    Object.keys(userTyping).forEach((key)=>{
                        if(key.endsWith("_timeout")) clearTimeout(userTyping[key]);
                    })

                    typingUsers.delete(userId);
                }

                await User.findByIdAndUpdate(userId,{
                    isOnline:false,
                    lastSeen:new Date()
                })

                io.emit("user_status",{
                    userId,
                    isOnline:false,
                    lastSeen=new Date()
                })

                socket.leave(userId);
            }
            catch(error){
                console.error("Error handling disconnection",error);
            }
        }

        socket.on("disconnect",handleDisconnected);
    });

    //Attach the online users map to socket server for external  use
    io.socketUserMap=onlineUsers;

    return io;
}


module.exports={
    initializeSocket    
}
