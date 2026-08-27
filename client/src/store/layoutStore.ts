import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types/user';

type ActiveTab = 'chats' | 'profile' | 'settings';

interface LayoutState {
    activeTab: ActiveTab;
    selectedContact: User | null;
    setSelectedContact: (contact: User | null) => void; //void here means the function doesn't return a value
    setActiveTab: (tab: ActiveTab) => void;
}

const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            activeTab: 'chats',
            selectedContact: null,
            setSelectedContact: (contact) => set({ selectedContact: contact }),
            setActiveTab: (tab) => set({ activeTab: tab })
        }),
        {
            name: "layout-storage"
        }
    )
)

export default useLayoutStore;