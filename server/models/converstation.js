const mongoose=require("mongoose");




//Conversation will only contain the metadata of the chat
//Like who are the people involved in the chat, what is the last message and what is the unread count
const conversationSchema=new mongoose.Schema({

    //We store an array of objects since we need id of participants which are more than 1
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    lastMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    unreadCount:{
        type:Number,
        default:0
    }
})

const Conversation=mongoose.model("Conversation",conversationSchema);
module.exports=Conversation