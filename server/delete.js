const Conversation = require("./models/converstation");

const sendMessage=async(req,res)=>{
    try{
        const {senderId,receiverId,content,messageStatus}=req.body;
        const file=req.file;
        const participants=[senderId,receiverId].sort();

        let conversation=await Conversation.findOne({
            participants:participants
        });

        if(!conversation){
            conversation=new Conversation({
                participants,
            });

            await conversation.save();
        }
    }
}