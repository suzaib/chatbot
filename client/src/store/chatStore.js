const useChatStore=create((set,get)=>({
    conversation:[], //list of all conversations
    currentConversation:null,
    messages:[],
    loading:false,
    error:null,
    onlineUsers:new Map(),
    typingUsers:new Map(),


    //Socket Event Listener
    initSocketListeners:()=>{
        const socket=getSocket();
        if(!socket) return;

        //Remove existing Listeners to prevent duplicate handlers
        socket.off("receive_message");
        socket.off("user_typing");
        socket.off("user_status");
        socket.off("message_send");
        socket.off("message_error");
        socket.off("message_deleted");

        //Listen for incoming messages
        socket.on("receive_message",(message)=>{

        });

        //Confirm message delivery
        socket.on("message_send",(message)=>{
            set((state)=>({
                messages:state.messages.map((msg)=>
                msg._id===message._id? {...msg}:msg)
            }))
        })

        //Update message status
        socket.on("message_status_update",({messageId,messageStatus})=>{
            set((state)=>({
                messages:state.messages.map((map)=>
                msg._id===messageId? {...msg,messageStatus}:msg)
            }))
        })

        //Handle reaction on message
        socket.on("reaction_update",({messageId,reactions})=>{
            set((state)=>({
                messages:state.messages.map((msg)=>
                msg._id===messageId ? {...msg,reactions}:msg)
            }))
        })

        //Handle message removal from local state
        socket.on("message_deleted",({deletedMessageId})=>{
            set((state)=>({
                message:state.messages.filter((msg)=>msg._id!=deletedMessageId)
            }))
        })

        //Handle any message sending error
        socket.on("message_error",(error)=>{
            console.error("message error",error)
        })

        //Listener for typing users
        //The map stores conversationIDs->Set of userIDs
        //So the map looks like this :
        // ConvoID1->{user1, user2}
        socket.on("user_typing",({userId,conversationId,isTyping})=>{
            set((state)=>{
                const newTypingUsers=new Map(state.typingUsers);

                //First we check whether the convoId is there in the typing users map
                //If not then we add it there
                if(!newTypingUsers.has(conversationId)) newTypingUsers.set(conversationId,new Set());

                //Then we get the set from the conversationID
                const typingSet=newTypingUsers.get(conversationId);

                //If the user is typing, we add him to the set, otherwise we remove him
                //Since we are using a set, we can't add it twice
                if(isTyping) typingSet.add(userId);
                else typingSet.delete(userId);

                return {typingUsers:newTypingUsers};
            })
        })

        //Track user's online/offline status
        socket.on("user_status",({userId,isOnline,lastSeen})=>{
            set((state)=>{
                const newOnlineUsers=new Map(state.onlineUsers);
                newOnlineUsers.set(userId,{isOnline,lastSeen});
                return {isOnline:newOnlineUsers}
            })
        })

        //Emit status check for all users, that is, check which user is online or offline
        const {conversations}=get();
        if(conversations?.data.length>0){
            conversations.data?.forEach((conversation)=>{
                const otherUser=conversation.participants.find(
                    (p)=>p._id!==get().currentUser._id
                );

                if(otherUser._id){
                    socket.emit("get_user_status",otherUser._id,(status)=>{
                        set((status)=>{
                            const newOnlineUsers=new Map(state.onlineUsers);
                            newOnlineUsers.set(state.userId,{
                                isOnline:state.isOnline,
                                lastSeen:state.lastSeen
                            });
                            return {onlineUser:newOnlineUsers}
                        })
                    })
                }
            })
        }

    },

    setCurrentUser:(user)=>set({currentUser}),

    //Fetch all conversations
    fetchConversations:async()=>{
        set({loading:true, error:null});
        try{
            const {data}=await axiosInstance.get("/chats/conversations");
            set({conversations:data,loading:false}),
            get().initSocketListeners();

            return data;
        }
        catch(error){
            set({
                error:error?.response?.data?.message || error?.message,
                loading:false
            });
            return null;
        }
    },

    //Fetch messages for a conversation
    fetchMessages:async(conversationId)=>{
        if(!conversationId) return;

        set({loading:true,error:false});

        try{
            const {data}=await axiosInstance.get(`/chats/conversations/${conversationId}/messages`);

            const messageArray=data.data || data || [];

            set({
                messages:messageArray,
                currentConversation:conversationId,
                loading:false
            })

            //Mark unread messages as read
            const {markMessagesAsRead}=get();
            markMessagesAsRead();

            return messageArray;
        }
        catch(error){
            set({
                error:error?.response?.data?.message || error?.message,
                loading:false
            })

            return [];
        }
    },

    //Send messages in real time
    sendMessage:async(formData)=>{
        const senderId=formData.get("sender_id");
        const receiverId=formData.get("receiver_id");
        const media=formData.get("media");
        const content=formData.get("content");
        const messageStatus=formData.get("messageStatus");

        const socket=getSocket();

        const {conversations}=get();
        let conversationId=null;
        if(conversation?.data?.length){
            const conversation=conversations.data.find((conv)=>
            conv.participants.some((p)=> p._id===senderId) && 
            conv.participants.some((p)=>p._id==receiverId));

            if(conversation){
                conversationId=conversation._id;
                set({currentConversation:conversationId});
            }
        }

        //Suppose we send a message, then for it to be displayed on our screen, it first needs to go to the server, get stored in the backend and then be showed on our UI
        //But this is time taking so we immediately show the msg in our chat and after the whole processes is finished we replace its temp id by the actual mongodb id
        const tempId=`temp-${Date.now()}`;
        const optimisticMessage={
            _id:tempId,
            sender:{_id:senderId},
            receiver:{_id:receiverId},
            conversation:conversationId,
            imageOrVideoUrl:media && typeof media!=='string' ? URL.createObjectURL(media):null,
            content:content,
            contentType:media? media.type.startsWith("image")? "image":"video":"text",
            createdAt:new Date().toISOString(),
            messageStatus,
        };

        set((state)=>({
            messages:[...state.messages,optimisticMessage]
        }));

        try{
            const {data}=await axiosInstance.post("/chats/send-message",formData,
                {headers:{"Content-Type":"multipart/form-data"}}
            );

            const messageData=data.data || data;

            //Replace optimistice message with real one
            set((state)=>({
                messages:state.messages.map((msg)=>
                msg._id===tempId? messageData:msg)
            }));

            return messageData;
        }
        catch(error){
            console.error("Error sending message",error);
            set((state)=>({
                messages:state.messages.map((msg)=>
                msg._id===tempId? {...msg,messageStatus:"failed"}:msg),
                error:error?.response?.data?.message || error?.message
            }));

            throw error;
        }
    },


    //Receive Messages
    //The socket gives us the message but we still need to update our zustand store with the message and update the UI as well
    receiveMessage:(message)=>{
        if(!message) return ;
        const {currentConversation,currentUser,messages}=get();

        //If the message is already in the message array, that is, it is already in the UI, just return
        const messageExists=messages.some((msg)=>msg._id === message._id)
        if(messageExists) return;

        //Updating the zustand store to store these messages
        if(message.conversation===currentConversation){
            set((state)=>({
                messages:[...state.messages,message]
            }));

            //Automatically mark as read
            if(message.receiver?._id===currentUser?._id) get().markMessagesAsRead();
        }

        //Update conversation preview and unread count
        //We update the unread count only when we receive a message and not when we send a message. simple yet needs to be implemented
        set((state)=>{
            const updateConversations=state.conversations?.data?.map((conv)=>{
                if(conv._id===message.conversation){
                    return {
                        ...conv,
                        lastMessage:message,
                        unreadCount:message?.receiver?._id===currentUser?._id? (conv.unreadCount || 0)+1:conv.unreadCount || 0
                    }
                }

                return conv;
            })

            return {
                conversations:{
                    ...state.conversations,
                    data:updatedConversations
                },
            }
        })
    },


    //Mark as read
    markMessagesAsRead:async()=>{

        //Taking all the messages and the current User
        const {messages,currentUser}=get();

        //If there are no messages or no user, there is nothing to do , so just return
        if(!messages.length || !currentUser) return;

        //Find unread messages ==> get their ids ==> remove any undefined values
        const unreadIds=messages.filter((msg)=> msg.messageStatus !== 'read' && msg.receiver?._id === currentUser?._id).map((msg)=> msg._id).filter(Boolean) //Boolean is needed to remove any falsy values

        //If there are no unread messages, return
        if(!unreadIds.length) return;

        try{

            //Now we tell our server, that mark these messages as read, so the backend updates that in the database
            const {data}=await axiosInstance.put("/chats/messages/read",{
                messageIds:unreadIds
            });

            //Now we update the frontend immediately
            set((state)=>({
                message:state.messages.map((msg)=> unreadIds.includes(msg._id)? {...msg,messageStatus:"read"}:msg)
            }))

            //Tell the sender that these messages were read 
            const socket=getSocket();
            if(socket){
                socket.emit("message_read",{
                    messageIds:unreadIds,
                    senderIds:messages[0]?.sender?._id
                })
            }
        }
        catch(error){
            console.error("Failed to mark messages as read",error);
        }
    },

    //Deleting Messages
    deleteMessage:async(messageId)=>{
        try{
            await axiosInstance.delete(`/chats/messages/${messageId}`);

            set((state)=>({
                messages:state.messages?.filter((msg)=> msg?._id!==messageId)
            }))
            return true;
        }
        catch(error){
            console.error("error deleting message",error);
            set({error:error.response?.data?.message || error.message})
            return false;
        }
    },

    //Add or Change Reactions
    addReaction:async(messageId,emoji)=>{
        const socket=getSocket();
        const {currentUser}=get();
        if(!socket || !currentUser) return;

        socket.emit("add_reaction",{
            messageId,
            emoji,
            userId:currentUser?._id
        })
    },

    //Now we create typing indicator events which will be called when the user starts or stops typing
    //Starting typing indicator
    startTyping:(receiverId)=>{
        const {currentConversation}=get();
        const socket=getSocket();
        if(!socket || !currentConversation || !receiverId) return;

        socket.emit("typing_start",{
            conversationId:currentConversation,
            receiverId
        })
    },

    //Stop typing indicator
    stopTyping:(receiverId)=>{
        const {currentConversation}=get();
        const socket=getSocket();
        if(!socket || !currentConversation || receiverId) return;

        socket.emit("typing_stop",{
            conversationId:currentConversation,
            receiverId
        })
    },

    //Check whether the user is typing or not
    isUserTyping:(userId)=>{
        const {typingUsers,currentConversation}=get();
        if(!currentConversation || !typingUsers.has(currentConversation) || !userId) return false;

        return typingUsers.get(currentConversation).has(userId);
    },

    //Is user online
    isUserOnline:(userId)=>{
        if(!userId) return null;
        const {onlineUsers}=get();
        return onlineUser.get(userId)?.isOnline || false;
    },

    getUserLastSeen:(userId)=>{
        if(!userId) return null;
        const {onlineUsers}=get();
        return onlineUsers.get(userId)?.lastSeen || null;
    },

    //Reset the state using  the cleaner function
    cleanup:()=>{
        set({
            conversations:[],
            currentConversation:null,
            messages:[],
            onlineUsers:new Map(),
            typingUsers:new Map(),
        })
    }


}))

export default useChatStore;