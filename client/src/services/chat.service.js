import {io} from 'socket.io-client';


let socket=null;



const initializeSocket=()=>{

    //If socket is already initialised, return that
    if(socket) return socket;

    const user=useUserStore().getState().user;

    const BACKEND_URL=process.env.BACKEND_URL;

    socket=io(BACKEND_URL,{
        withCredentials:true,
        transports:["websocket","polling"],
        reconnectionAttempts:5,
        reconnectionDelay:1000
    })

    //Connection Events
    socket.on("connect",()=>{
        socket.emit("user_connected",user._id)
    })

    socket.on("connect_error",(error)=>{
        console.error("socket connection error",error)
    })

    //Disconnected Events
    socket.on("disconnect",(reason)=>{
        console.log("socket disconnected",reason);
    })

    return socket;
}

const getSocket=()=>{
    if(!socket) return initializeSocket();
    return socket;
}

const disconnectSocket=()=>{
    if(socket){
        socket.disconnect();
        socket=null;
    }
}

module.exports={
    initializeSocket,
    getSocket,
    disconnectSocket
}