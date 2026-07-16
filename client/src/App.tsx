import { 
  createBrowserRouter, 
  RouterProvider
 } from "react-router-dom"
import Login from "./pages/UserLogin/Login"


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