const mongoose=require("mongoose");

const Conversation=mongoose.model("Conversation",conversationSchema);
module.exports=Conversation


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
