const {Server}=require('socket.io');
const User=require("../models/user");
const Message=require("../models/message")


//We need all the users who are online
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
        console.log(`User connected : ${socket.id}`)
        let userId=null;

        //Handle user connection and mark them online in db
        socket.on("user_connected",async(connectingUserId)=>{
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
                io.emit("user_status",{userId,isOnline:true});
            }
            catch(error){
                console.error("Error handling user connection",error);
            }
        })
    })
}
