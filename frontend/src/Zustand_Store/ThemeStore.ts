import { create } from "zustand";

interface ThemeStore{
    primaryColor:string,
    secondaryColor:string,
    tertiaryColor:string
}

export const useThemeStore= create<ThemeStore>((set)=>({
    primaryColor:"#E0E1DD",
    secondaryColor:"#111111",
    tertiaryColor:"#96C0B7"
}))