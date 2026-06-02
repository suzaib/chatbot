const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    phoneNumber:{
        type:Number,
        unique:true,
        sparse:true, //This means only check uniqueness when the phone number is entered
    },
    phoneSuffix:{
        type:String,
        unique:false,
    },
    userName:{
        type:String,
    },
    email:{
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
        validator: function(email) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        },
        message: props => `${props.value} is not a valid email address`
        }
    },
    emailOTP:{
        type:String,
    },
    emailOTPExpiry:{
        type:Date,
    },
    profilePicture:{
        type:String,
    },
    about:{
        type:String,
    },
    lastSeen:{
        type:Date,
    },
    isOnline:{
        type:Boolean,
        default:false,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    agreed:{
        type:Boolean,
        default:false,
    }
},{timestamps:true});


const User=mongoose.model("User",userSchema);
module.exports=User;