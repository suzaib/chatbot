import { useState } from 'react';
import useLoginStore from '../../store/useLoginStore';

//Import everything from yup and put it inside an object named yup
import * as yup from 'yup';

import {yupResolver} from "@hookform/resolvers/yup";

//Validation Schema
const loginValidationSchema=yup
.object()
.shape({
  email:yup.string().nullable().notRequired().matches()
})
const Login = () => {
  const {step,setStep,userEmailData,setUserEmailData,resetLoginState}=useLoginStore();
  const [email,setEmail]=useState("");
  const [otp,setOTP]=useState(["","","","","",""]);
  
  return (
    <div>Login</div>
  )
}

export default Login