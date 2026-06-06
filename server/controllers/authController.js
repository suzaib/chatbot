//Step 1 : Send OTP

const User = require("../models/user");
const generateOTP = require("../utils/otpGenerator");
const sendOTPToEmail=require("../services/emailService");
const generateToken = require("../utils/tokenGenerator");

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

const updateProfile
module.exports={
    sendOTP,
    verifyOTP
}



