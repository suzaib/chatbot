//Step 1 : Send OTP

const User = require("../models/user");
const generateOTP = require("../utils/otpGenerator");
const sendOTPToEmail=require("../services/emailService/")

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

        return response(res,200,'Otp sent successfully',user)
    } catch (error) {
        console.error(error);
        return response(res,500,'Internal Server Error')
    }
}



