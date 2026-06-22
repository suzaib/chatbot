const createStatus=async(req,res)=>{
    try{
        const {content,contentType}=req.body;
        const userId=req.user.userId;
        const file=req.file;

        let mediaUrl=null;
        let finalContentType=contentType || 'text';

        //Handle file upload
        if(file){
            const uploadFile=await uploadFileToCloudinary(file);
            if(!uploadFile.secure_url) return response(res,400,"Failed to upload media");

            mediaUrl=uploadFile.secure_url;

            //Setting the content type
            if(file.mimetype.startsWith('image')) finalContentType="image";
            else if(file.mimetype.startsWith('video')) finalContentType="video";
            else return response(res,400,"Unsupported file type");
        }
        else if(content?.trim()) finalContentType="text";
        //Trim helps us eliminate empty m
        else return response(res,400,"Message content is required");
    }
    catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

