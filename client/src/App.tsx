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
        path:"/pro"
      }
    ]
  }
])

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/user-login",
                element: <Login />
            }
        ]
    },

    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <HomePage/>
            },
            {
                path: "/profile",
                element: <Profile />
            },
            {
                path: "/settings",
                element: <Settings />
            }
        ]
    }
]);
const App = () => {
  return (
  <>
    <ToastContainer position='top-right' autoClose={3000}/>
    <RouterProvider router={router}/>
  </>
  )
}

export default App