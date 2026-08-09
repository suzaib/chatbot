import { 
  createBrowserRouter, 
  RouterProvider
 } from "react-router-dom"
import Login from "./pages/UserLogin/Login"

import {ToastContainer} from 'react-toastify';
import 'react-toastify/ReactToastify.css';

const router=createBrowserRouter([
  {
    path:"/user-login",
    element:<Login/>
  }
])
const App = () => {
  return <RouterProvider router={router}/>
}

export default App