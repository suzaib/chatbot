import { useState } from 'react';
import useLoginStore from '../../store/useLoginStore';
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/useThemeStore";
import { motion } from 'framer-motion';
import {sendOtp,verifyOtp} from "../../services/user.service.js";



//Import everything from yup and put it inside an object named yup
import * as yup from 'yup';

import { yupResolver } from "@hookform/resolvers/yup";
import { FaWhatsapp } from 'react-icons/fa';
import Spinner from '../../utils/Spinner';

//Validation Schema
const loginValidationSchema = yup
  .object()//The data being validated is an object
  .shape({//Defines the shape/structure of the object
    email: yup.string().trim().email("Please enter valid email").required("Email is required")
  })


const otpValidationSchema = yup
  .object()
  .shape({
    otp: yup.string().length(6, "OTP must be exactly 6 digits").required("OTP is required")
  })

const profileValidationSchema = yup
  .object()
  .shape({
    username: yup.string().required("username is required"),
    agreed: yup.bool().oneOf([true], "You must accept the terms and conditions")
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
  const { step, setStep, userEmailData, setUserEmailData, resetLoginState } = useLoginStore();
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const [profilePictureFile, setProfilePictureFile] = useState(null); //This stores the actual file
  const [profilePicture, setProfilePicture] = useState(null);  //This stores the url of the image

  const [error, setError] = useState("");
  const navigate = useNavigation();

  const { theme, setTheme } = useThemeStore();

  const { setUser } = useUserStore();

  const [loading,setLoading]=useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({ resolver: yupResolver(loginValidationSchema) });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue
  } = useForm({ resolver: yupResolver(otpValidationSchema) })

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch
  } = useForm({ resolver: yupResolver(profileValidationSchema) });

  const onLoginSubmit=async()=>{
    try{
      setLoading(true);
      if(email){
        const response=await sendOtp(email);
        if(response.status==='success'){
          toast.info("OTP is sent to your email");
          setUserEmailData({email});
          setStep(2);
        }
      }
    }
    catch(error){
      console.error(error);
      setError(error.message || "Failed to send OTP");
    }
    finally{
      setLoading(false);
    }
  }

  const onOtpSubmit=async()=>{
    try{
      setLoading(true);
      if(!userEmailData) throw new Error("Email data is missing");

      const otpString=otp.join("");
      let response;
      if(userEmailData?.email) response=await verifyOtp(email,otpString);
      if(response.status==='success'){
        toast.success("Otp is verified successfully");
        const user=response.data?.user;
        if(user?.username && user?.profilePicture){
          setUser(user);
          toast.success("Welcome to sphinx");
          navigate('/');
          resetLoginState();
        }
        else setStep(3);
      }
    }
    catch(error){
      console.error(error);
      setError(error.message || "Failed to verify OTP");
    }
    finally{
      setLoading(false);
    }
  }

  const handleChange=(e)=>{
    const file=e.target.files[0];
    if(file){
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  }

  const onProfileSubmit=async(data)=>{
    try{
      setLoading(true);
      const formData=new FormData();
      formData.append("username",data.username);
      formData.append("agreed",data.agreed);
      if(profilePictureFile) formData.append("media",profilePictureFile);
      else formData.append("profilePicture",selectedAvatar);

      await updatedUserProfile(formData);
      toast.success("Welcome back to sphinx");
      navigate('/');
      resetLoginState();
    }
    catch(error){
      console.error(error);
      setError(error.message || "Failed to update user profile");
    }
    finally{
      setLoading(false);
    }
  }

  const handleOtpChange=(idx,val)=>{
    const newOtp=[...otp];
    newOtp[idx]=val;
    setOtp(netOtp);
    setOtpValue("otp",newOtp.join(""));
    if(val && idx<5) document.getElementById(`otp-${idx+1}`)?.focus();
  }

  const handleBack=()=>{
    setStep(1);
    setUserEmailData(null);
    setOtp(["","","","","",""]);
    setError("");
  }

  const ProgressBar = () => {
    <div className={`w-full ${theme === 'dark' ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5 mb-6`}>
      <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / 3) * 100}%` }}>
      </div>
    </div>
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? "bg-gray-900" : "bg-gradient-to-br from-green-400 to-blue-500"} flex items-center p-4 overflow-hidden`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === 'dark' ? "bg-gray-800 text-white" : "bg-white"} pd-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <FaWhatsapp className="w-16 h-16 text-white" />
        </motion.div>

        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}></h1>
        Whatsapp Login
      </h1>
      <ProgressBar />

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {step === 1 && (
        <form className="space-y-4" onSubmit={handleLoginSubmit(onLoginSubmit)}>
          <p className={`text-center ${theme === 'dark' ? "text-gray-300" : "text-gray-600"} mb-4  `}>
            Enter Your Email to recieve a verification code
          </p>
          <div className="relative">
            <div className="flex">
              <div className="relative w-1/3">
                <button
                  type="button"
                  className={`flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center ${theme === 'dark' ? "text-white bg-gray-700 border-gray-600" : "text-gray-900 bg-gray-100 border-gray-300"} border rounded-s-lg hover:bg-gray-200 focus:right-4 focus:outline-none focus:ring-gray-100`}>

                </button>
              </div>
              <input
                type="text"
                {...loginRegister("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={`w-2/3 px-4 py-2 border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} rounded-md focus:outline-none focus:right-2 focus:ring-green-500 ${loginErrors.email ? "border-red-500":""}`}/>
            </div>
            {loginErrors.email && (
              <p className="text-red-500 text-sm">
                {loginErrors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
            {loading? <Spinner/> : "Send OTP"}
          </button>
        </form>
      )}

    </motion.div> 
    </div >
  )
}

export default Login