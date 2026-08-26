import { useEffect, useState } from "react";
import ChatList from "../pages/ChatSection/ChatList";
import Layout from "./Layout";
import { motion } from 'framer-motion';
import type { User } from "../types/user";
import useLayoutStore from "../store/useLayoutStore";
import { getAllUsers } from "../services/user.service";

const HomePage = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  )

  //Async functions always return a promise
  //Function to get all the users
  const fetchAllUsers = async (): Promise<void> => {
    try {
      const result = await getAllUsers();
      if (result.status === 'success') setAllUsers(result.data);
    }
    catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchAllUsers();
  }, [])
  return (
    <Layout
      isThemeDialogOpen={isThemeDialogOpen}
      toggleThemeDialog={toggleThemeDialog}
      isStatusPreviewOpen={isStatusPreviewOpen}
      statusPreviewContent={statusPreviewContent}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full">
        <ChatList
          contacts={allUsers}
          setSelectedContact={setSelectedContact}
        />
      </motion.div>
    </Layout>
  )
}

export default HomePage