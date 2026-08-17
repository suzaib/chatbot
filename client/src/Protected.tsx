import { useState } from "react";
import { useLocation } from "react-router-dom";
import useUserStore from "./store/useUserStore";
import {checkUserAuth} from "./services/user.service";
import Loader from "./utils/Loader";

//Before allowing the user to access the pages within, check if they are logged in or not
//If they aren't, send them to login page
const ProtectedRoute=()=>{
    const location=useLocation(); //Contains information about the current URL
    const [isChecking,setIsChecking]=useState(true);

    const {isAuthenticated,setUser,clearUser}=useUserStore();
    useEffect(()=>{
        const verifyAuth=async()=>{
            try{
                const result=await checkUserAuth();
                if(result?.isAuthenticated) setUser(result.user);
                else clearUser();
            }
            catch(error){
                console.error(error);
                clearUser();
            }
            finally{
                setIsChecking(false);
            }
        }
        verifyAuth();
    },[setUser,clearUser])

    if(isChecking) return <Loader/>
    if(!isAuthenticated) return <Navigate to="/user-login" state={{from:location}} replace/>

    return <Outlet/>
};

const PublicRoute=()=>{
    const isAuthenticated=useUserStore(state=> state.isAuthenticated);
    if(isAuthenticated) return <Navigate to="/" replace/>
    return <Outlet/>
}


module.exports={
    ProtectedRoute,
    PublicRoute,
}