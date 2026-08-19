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

        //Handle Reaction
        socket.on("reaction_update",({messageId,reactions})=>{
            set((state)=>({
                messages:state.messages.map((msg)=>
                msg._id===messageId ? {...msg,reactions}:msg)
            }))
        })
    }
}))