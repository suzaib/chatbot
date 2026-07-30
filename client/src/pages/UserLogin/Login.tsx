import { useState } from 'react';
import useLoginStore from '../../store/useLoginStore';
import yup from 'yup';
//Validation Schema
const loginValidationSchema=yup
const Login = () => {
  const {step,setStep,userEmailData,setUserEmailData,resetLoginState}=useLoginStore();
  const [email,setEmail]=useState("");
  const [otp,setOTP]=useState(["","","","","",""]);
  
  return (
    <div>Login</div>
  )
}

export default Login