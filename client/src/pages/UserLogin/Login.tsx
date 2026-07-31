import { useState } from 'react';
import useLoginStore from '../../store/useLoginStore';
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/useThemeStore";

//Import everything from yup and put it inside an object named yup
import * as yup from 'yup';

import {yupResolver} from "@hookform/resolvers/yup";

//Validation Schema
const loginValidationSchema=yup
.object()//The data being validated is an object
.shape({//Defines the shape/structure of the object
  email:yup.string().trim().email("Please enter valid email").required("Email is required")})


const otpValidationSchema=yup
.object()
.shape({
  otp:yup.string().length(6,"OTP must be exactly 6 digits").required("OTP is required")
})

const profileValidationSchema=yup
.object()
.shape({
  username:yup.string().required("username is required"),
  agreed:yup.bool().oneOf([true],"You must accept the terms and conditions")
})


//Avatars
const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]
const Login = () => {
  const {step,setStep,userEmailData,setUserEmailData,resetLoginState}=useLoginStore();
  const [email,setEmail]=useState("");
  const [otp,setOTP]=useState(["","","","","",""]);
  const [profilePicture,setProfilePicture]=useState(null);
  const [selectedAvatar,setSelectedAvatar]=useState(avatars[0]);  
  const [profilePictureFile,setProfilePictureFile]=useState(null);
  const [error,setError]=useState("");
  const navigate=useNavigation();

  const {theme,setTheme}=useThemeStore();

  const {setUser}=useUserStore();

  const {
    register:loginRegister,
    handleSubmit:handleLoginSubmit,
    formState:{errors:loginError},
  }=useForm({resolver:yupResolver(loginValidationSchema)});

  const {
    handleSubmit=handleOtpSubmit,
    formState:{errors:otpErrors},
    setValue:setOtpValue
  }=useForm({resolver:yupResolver(otpValidationSchema)})

  const {
    register:profileRegister,
    handleSubmit:handleProfileSubmit,
    formState:{errors:profileErrors},
    watch
  }=useForm({resolver:yupResolver(profileValidationSchema)});
  
  return (
    <div className={`min-h-screen`}>

    </div>
  )
}

export default Login