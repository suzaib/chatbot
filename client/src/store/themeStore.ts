import {create} from "zustand";
import {persist,createJSONStorage} from "zustand/middleware";

type Theme='light' | 'dark';

interface ThemeState{
    theme:Theme;
    setTheme:(theme:Theme)=>void;
}

const useThemeStore=create<ThemeState>()(
    persist(
        (set)=>({
            theme:'light',
            setTheme:(theme)=>set({theme}),
        }),
        {
            name:"theme-storage",
            storage:createJSONStorage(()=>localStorage)
        }
    )
)

export default useThemeStore;