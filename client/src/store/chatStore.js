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
    sendMessage:async(formData)=>{},


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
        const {messages,currentUser}=get();
    }




}))