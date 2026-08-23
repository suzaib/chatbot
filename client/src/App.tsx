import { 
  createBrowserRouter, 
  RouterProvider
 } from "react-router-dom"
import Login from "./pages/UserLogin/Login"

import {ToastContainer} from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import UserDetails from "./components/UserDetails";
import Status from "./pages/StatusSection/Status";
import Settings from "./pages/SettingsSection/Settings";
import HomePage from "./components/HomePage";
import { useEffect } from "react";
import {initializeSocket} from './services/chat.service.js';

const router=createBrowserRouter([
  {
    element:<PublicRoute/>,
    children:[
      {
        path:"/user-login",
        element:<Login/>
      }
    ]
  },
  {
    element:<ProtectedRoute/>,
    children:[
      {
        path:"/home",
        element:<HomePage/>
      },
      {
        path:"/user-profile",
        element:<UserDetails/>
      },
      {
        path:"/status",
        element:<Status/>
      },
      {
        path:"/settings",
        element:<Settings/>
      }
    ]
  }
])

const App = () => {

  const {user}=useUserStore();
  const {setCurrentUser,initSocketListeners,cleanup}=useChatStore();

  useEffect(()=>{
    if(user?._id){
      const socket=initializeSocket();

      if(socket){
        setCurrentUser(user);
        initSocketListeners();


    }

    //Cleanup function
    return ()=>{
      cleanup();
      disconnectSocket();
    }
  },[user,setCurrentUser,initSocketListeners,cleanup])


  return (
  <>
    <ToastContainer position='top-right' autoClose={3000}/>
    <RouterProvider router={router}/>
  </>
  )
}

export default App