import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useLayoutStore=create(
    persist(
        (set)=>({
            activeTab:'chats',
            selectedChat:null,
            setSelectedChat:(chat)=>set({setSelectedChat}),
            setActiveTab:(tab)=> set({activeTab})
        }),
        {
            name:"layout-storage",
            getStorage:()=>localStorage,
        }
    )
)