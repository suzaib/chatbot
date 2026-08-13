import { motion,AnimatePresence } from "framer-motion";

const Layout = ({children,isThemeDialogueOpen,toggleThemeDialogue,isStatusPreviewOpen,statusPreviewContent}) => {

  const selectedContact=useLayoutStore(state=>state.selectedContact);
  const setSelectedContact=useLayoutStore(state=>state.setSelectedContact);
  const location=useLocation();
  const [isMobile,setIsMobile]=useState(window.innerWidth<760);
  const {theme,setTheme}=useThemeStore();

  useEffect(()=>{
    const handleResize=()=>{
      setIsMobile(window.innerWidth<768)
    }

    window.addEventListener("resize",handleResize);
    return ()=> window.removeEventListener("resize",handleResize);
  },[])
  return (
    <div className={`min-h-screen ${theme==='dark'? "bg-[#111b21] text-white":"bg-gray-100 text-black"} flex-relative`}>
      {!isMobile && <Sidebar/>}
      <div className={`flex-1 flex overflow-hidden ${isMobile? "flex-col":""}`}>
        <AnimatePresence initial={false}>
          {(!selectedContact || !isMobile) && (
            <motion.div 
              key="chatlist" 
              initial={{x:isMobile? "-100%":0}} 
              animate={{x:0}}
              exit={{x:"100%"}}
              transition={{type:"tween"}}
              className={`w-full md:w-2/5 h-full ${isMobile? "pb-16":""}`}
            >
              {children}
            </motion.div>
          )}
          {(selectedContact || !isMobile) && (
            <motion.div
              key="chatWindow"
              initial={{x:isMobile? "-100%":0}}
              animate={{x:0}}
              exit={{x:"-100%"}}
              transition={{type:"tween"}}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Layout