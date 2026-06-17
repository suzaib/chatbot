//Step 1 : Send OTP

const User = require("../models/user");
const generateOTP = require("../utils/otpGenerator");
const sendOTPToEmail=require("../services/emailService");
const generateToken = require("../utils/tokenGenerator");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");

const sendOTP=async(req,res)=>{
    const {email}=req.body;
    const otp=generateOTP();
    const expiry=new Date(Date.now()+5*60*1000); //1000 because Date.now() returns time elapsed since 1 January 1970 (UNIX Epoch) in milliseconds
    let user;
    try {
        if(email){
            user=await User.findOne({email});

            if(!user) user=new User({email})
            user.emailOTP=otp;
            user.emailOTPExpiry=expiry;
            await user.save();

            return response(res,200,'OTP Sent to your email',{email})
        }
        
        await User.save();
        await sendOTPToEmail(email,otp);

        return response(res,200,'Otp sent successfully',user)
    } catch (error) {
        console.error(error);
        return response(res,500,'Internal Server Error')
    }
}


//Verifying the OTP
const verifyOTP=async(req,res)=>{
    const {email,otp}=req.body;
    try{
        let user;
        if(email){
            user=await User.findOne({email});
            if(!user) return response(res,400,'User not found');

            const now=new Date();
            if(!user.emailOTP || String(user.emailOTP)!=String(otp) || now>user.emailOTPExpiry) return response(res,400,'Invalid or expired OTP');
            user.isVerified=true;
            user.emailOTP=null;
            user.emailOTPExpiry=null;
            
            await user.save();
        }

        const token=generateToken(user?._id);
        res.cookie("auth_token",token,{
            httpOnly:true,
            maxAge:1000*60*60*24*365
        });

        return response(res,200,'OTP Verified');
    }
    catch(error){
        console.error(error);
        return response(res,500,'Internal Server Error');
    }
}

const updateProfile=async(req,res)=>{
    const {username,agreed,about}=req.body;
    const userId=req.user.userId;
    try {
        const user=await User.findById(userId);
        const file=req.file;
        if(file){
            const uploadResult=await uploadFileToCloudinary(file)
            user.profilePicture=uploadResult?.secure_url;
        }
        else if(req.body.profilePicture) user.profilePicture=req.body.profilePicture;

        //We update only that field which is passed
        //For eg if the user updates his profile and only passes a new username, we only update username
        if(username) user.username=username;
        if(agreed) user.agreed=agreed;
        if(about) user.about=about;

        await user.save();

        return response(res,200,'User Profile Updated Successfully',user);
    } 
    catch (error) {
        console.error(error);
        return response(res,500,"Internal Server Error");
    }
};

const checkAuthenticated=async(req,res)=>{
    try {
        const userId=req.user.userId;
        if(!userId) return response(res,404,'Unauthorized, Please login to access the app');

        const user=await User.findById(userId);
        if(!user) return response(res,404,"User not found");
        return response(res,200,'User retrieved',user);
    } 
    catch (error) {
        console.error(error);
        return response(res,500,'Internal server error');
    }
};

const logout=(req,res)=>{
    try {
        res.cookie("auth_token","",{expires:new Date(0)});
        return response(res,200,"User logged out successfully");
    } 
    catch (error) {
        console.error(error);
        return response(res,500,"Internal server error");
    }
};

const getAllUsers=async(req,res)=>{
    const loggedInUser=req.user.userId;
    try{

        //We find all the users except us(the logged in person)
        //$ne means not equal
        const users=await User.find({_id:{$ne:loggedInUser}}).select(
            "username profilePicture lastSeen isOnline about"
        ).lean();

        const usersWithConversation = await Promise.all
    }
}

module.exports={
    sendOTP,
    verifyOTP,
    updateProfile,
    checkAuthenticated,
    logout
}



