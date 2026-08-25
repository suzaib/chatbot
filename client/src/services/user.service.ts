import axiosInstance from "./url.service"

const sendOtp=async(email)=>{
    try{
        const response=await axiosInstance.post("/auth/send-otp",{email});
        return response.data;
    }
    catch(error){
        throw error.response? error.response.data:error.message;
    }
}

const verifyOtp=async(email,otp)=>{
    try{
        const response=await axiosInstance.post("/auth/verify-otp",{email,otp});
        return response.data;
    }
    catch(error){
        throw error.response? error.response.data:error.message;
    }
}

const updateUserProfile=async(updatedData)=>{
    try{
        const response=await axiosInstance.put("/auth/update-profile",updatedData);
        return response.data;
    }
    catch(error){
        throw error.response? error.response.data:error.message;
    }
}

const checkUserAuth=async()=>{
    try{
        const response=await axiosInstance.get("/auth/check-auth");
        if(response.data.status==='success') return {isAuthenticated:true,user:response?.data?.data};
        return {isAuthenticated:false};
    }
    catch(error){
        throw error.response? error.response.data:error.message;
    }
}

const logoutUser=async()=>{
    try{
        const response=axiosInstance.get("/auth/logout");
        return response.data;
    }
    catch(error){
        throw error.response? error.response.data:error.message;
    }
}

const getAllUsers=async()=>{
    try{
        const response=axiosInstance.get("/auth/users");
        return response.data;
    }
    catch(error){
        throw error.response? error.response.data:error.message;
    }
}

module.exports={
    sendOtp,
    verifyOtp,
    updateUserProfile,
    checkUserAuth,
    logoutUser,
    getAllUsers
}