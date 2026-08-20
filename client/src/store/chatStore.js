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

        //Emit status check for all users in conversation list
        const {conversations}=get();
        if()


    }
}))