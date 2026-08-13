import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useLayoutStore=create(
    persist(
        (set)=>({
            activeTab:'chats',
            selectedContact:null,
            setSelectedContact:(contact)=>set({setSelectedContact}),
            setActiveTab:(tab)=> set({activeTab})
        }),
        {
            name:"layout-storage",
            getStorage:()=>localStorage,
        }
    )
)