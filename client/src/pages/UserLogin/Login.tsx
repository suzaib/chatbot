import { useState } from 'react';
import useLoginStore from '../../store/useLoginStore.js';
import useUserStore from "../../store/useUserStore.js";
import useThemeStore from "../../store/useThemeStore";
import { motion } from 'framer-motion';
import { sendOtp, verifyOtp } from "../../services/user.service.js";



//Import everything from yup and put it inside an object named yup
import * as yup from 'yup';

import { yupResolver } from "@hookform/resolvers/yup";
import { FaArrowLeft, FaPlus, FaUser, FaWhatsapp } from 'react-icons/fa';
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
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const [profilePictureFile, setProfilePictureFile] = useState(null); //This stores the actual file
  const [profilePicture, setProfilePicture] = useState(null);  //This stores the url of the image

  const [error, setError] = useState("");
  const navigate = useNavigation();

  const { theme, setTheme } = useThemeStore();

  const { setUser } = useUserStore();

  const [loading, setLoading] = useState(false);

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

  const onLoginSubmit = async () => {
    try {
      setLoading(true);
      if (email) {
        const response = await sendOtp(email);
        if (response.status === 'success') {
          toast.info("OTP is sent to your email");
          setUserEmailData({ email });
          setStep(2);
        }
      }
    }
    catch (error) {
      console.error(error);
      setError(error.message || "Failed to send OTP");
    }
    finally {
      setLoading(false);
    }
  }

  const onOtpSubmit = async () => {
    try {
      setLoading(true);
      if (!userEmailData) throw new Error("Email data is missing");

      const otpString = otp.join("");
      let response;
      if (userEmailData?.email) response = await verifyOtp(email, otpString);
      if (response.status === 'success') {
        toast.success("Otp is verified successfully");
        const user = response.data?.user;
        if (user?.username && user?.profilePicture) {
          setUser(user);
          toast.success("Welcome to sphinx");
          navigate('/');
          resetLoginState();
        }
        else setStep(3);
      }
    }
    catch (error) {
      console.error(error);
      setError(error.message || "Failed to verify OTP");
    }
    finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  }

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);
      if (profilePictureFile) formData.append("media", profilePictureFile);
      else formData.append("profilePicture", selectedAvatar);

      await updatedUserProfile(formData);
      toast.success("Welcome back to sphinx");
      navigate('/');
      resetLoginState();
    }
    catch (error) {
      console.error(error);
      setError(error.message || "Failed to update user profile");
    }
    finally {
      setLoading(false);
    }
  }

  const handleOtpChange = (idx, val) => {
    const newOtp = [...otp]; //Creating a copy of the old otp array
    newOtp[idx] = val;
    setOtp(newOtp);
    setOtpValue("otp", newOtp.join(""));
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  }

  const handleBack = () => {
    setStep(1);
    setUserEmailData(null);
    setOtp(["", "", "", "", "", ""]);
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
                className={`w-2/3 px-4 py-2 border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} rounded-md focus:outline-none focus:right-2 focus:ring-green-500 ${loginErrors.email ? "border-red-500" : ""}`} />
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
            {loading ? <Spinner /> : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
          <p className={`text-center ${theme === 'dark' ? "text-gray-300" : "text-gray-600"} mb-4`}>
            Please enter the 6 digit otp sent to {userEmailData.email}
          </p>
          <div className='flex justify-between'>
            {otp.map((dig, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={dig}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className={`w-12 h-12 text-center border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} rounded-md focus:outline-none focus:ring-green-500 ${otpErrors.otp ? "border-red-500" : ""}`}
              />
            ))}
          </div>
          {otpErrors.otp && (
            <p className="text-red-500 text-sm">
              {otpErrors.otp.message}
            </p>
          )}

          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
            {loading ? <Spinner /> : "Verify OTP"}
          </button>

          <button type="button" onClick={handleBack} className={`w-full mt-2 ${theme === 'dark' ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"} py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center`}>
            <FaArrowLeft className="mr-2" />
            Wrong Email? Go Back
          </button>

        </form>
      )}


      {step === 3 && (
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className='space-y-4'>
          <div className='flex flex-col items-center mb-4'>
            <div className='relative w-24 h-24 mb-2'>
              <img src={profilePicture || selectedAvatar} alt="profile" className='w-full h-full rounded-full object-cover' />
              <label htmlFor='profile-picture' className='absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition duration-300'>
                <FaPlus className="w-4 h-4" />
              </label>
              <input type="file" id="profile-picture" accept='image/*' onChange={handleFileChange} className='hidden' />
            </div>

            <p className={`text-sm ${theme === 'dark' ? "text-gray-300" : "text-gray-500"} mb-2`}>
              Choose an avatar
            </p>

            <div className='flex flex-wrap justify-center gap-2'>
              {avatars.map((avatar, idx) => (
                <img key={idx} src={avatar} alt={`Avatar-${idx + 1}`} onClick={() => setSelectedAvatar(avatar)} className={`w-12 h-12 rounded-full cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 ${selectedAvatar === avatar ? "ring-2 ring-green-500" : ""}`} />
              ))}
            </div>
          </div>

          <div className='relative'>
            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? "text-gray-400" : "text-gray-600"}`} />
            <input
              {...profileRegister("username")}
              type="text"
              placeholder="Username"
              className={`w-full pl-10 pr-3 py-2 border {theme==='dark'? "bg-gray-700 border-gray-600 text-white":"bg-white border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-lg`}
            />

            {profileErrors.username && (
              <p className='text-red-500 text-sm mt-1'>
                {profileErrors.username.message}
              </p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <input
              {...profileRegister('agreed')}
              type="checkbox"
              className={`rounded ${theme === 'dark' ? "text-green-500 bg-gray-700" : "text-green-500"} focus:ring-green-500`}
            />
            <label htmlFor='terms' className={`text-sm ${theme === 'dark' ? "text-gray-300" : "text-gray-700"}`}>
              I agree to the {""}
              <a href="#" className='text-red-500 text-sm mt-1'>
                Terms and Conditions
              </a>
            </label>

          </div>
          
          {profileErrors.agreed && (
            <p className='text-red-500 hover:underline'>
              {profileErrors.agreed.message}
            </p>
          )}

          <button type="submit" disabled={!watch("agreed") || loading} className={`w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {loading ? <Spinner /> : "Create Profile"}
          </button>

        </form>
      )}

    </motion.div> 
    </div >
  )
}

export default Login