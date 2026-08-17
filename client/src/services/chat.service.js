import {io} from 'socket.io-client';


let socket=null;



const initializeSocket=()=>{

    //If socket is already initialised, return that
    if(socket) return socket;

    const user=useUserStore().getState()

}