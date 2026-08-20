socket.on("user_status",({userId,isOnline,lastSeen})=>{
    set((state)=>{
        const newOnlineUsers=new Map(state.onlineUsers);
        newOnlineUsers.set(userId,{isOnline,lastSeen});
        return {isOnline:newOnlineUsers}
    })
})