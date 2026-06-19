const sendMessage=async(req,res)=>{
    try{
        const {senderId,receiverId,content,messageStatus}=req.body;
        const file=req.file;

        const participants=[senderId,receiverId].sort();
        
        //Check if conversation already exists
        let conversation=await Conversation
    }
}