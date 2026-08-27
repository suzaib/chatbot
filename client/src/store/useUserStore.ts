import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user";

interface UserStore{
    user:User | null;
    isAuthenticated:boolean;
    setUser:(user:User)=>void;
    clearUser:()=>void;
}

const useUserStore=create<UserStore>()(
    persist(
        (set)=>({
            user:null,
            isAuthenticated:false,

            setUser:(user)=>set({user,isAuthenticated:true}),
            clearUser:()=>set({user:null,isAuthenticated:false}),
        }),
        {name:"user-storage"}
    )
)

export default useUserStore;