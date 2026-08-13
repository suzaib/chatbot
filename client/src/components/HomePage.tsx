import ChatList from "../pages/ChatSection/ChatList"
import Layout from "./Layout"
import {motion} from 'framer-motion';

const HomePage = () => {

  const setSelectedContact=useLayoutStore(
    (state)=>state.setSelectedContact
  );

  const [allUsers,setAllUsers]=useState([]);
  const getUser=async()=>{
    try{
      const result=await getAllUsers();
      if(result.status==='success') setAllUsers(result.data);
    }
    catch(error){
      console.error(error);
    }
  }

  useEffect(()=>{
    getAllUsers();
  },[])
  return (
    <Layout>
      <motion.div
        initial={{opacity:0}}
        animate={{opacity:1}}
        transition={{duration:0.5}}
        className="h-full">
        <ChatList contacts={allUsers} setSelectedContact={setSelectedContact}/>
      </motion.div>
    </Layout>
  )
}

export default HomePage