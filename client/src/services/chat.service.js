//io is a function provided by socket.io and we use it to create a connection
import {io} from 'socket.io-client';


//We declare socket outside the initialize socket, therefore it persists for the lifetime of this javascript
let socket=null;

//Since we have initialised socket outside, therefore even when initialize socket is called multiple times, it won't create a new socket each time
const initializeSocket=()=>{

    //If socket is already initialised, return that
    if(socket) return socket;

    //Get the user and don't sync with changes 
    const user=useUserStore().getState().user;


    const BACKEND_URL=process.env.BACKEND_URL;

    //Giving the backend url to connect this socket to the one running at backend
    socket=io(BACKEND_URL,{
        withCredentials:true, //Allow credentials such as cookies to be included in cross origin communication
        transports:["websocket","polling"], //How communication is transported
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