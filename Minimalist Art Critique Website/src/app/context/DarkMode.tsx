import { createContext, useContext } from "react";

export interface DarkModeCtx {
  dark: boolean;
  toggle: () => void;
}

export const DarkModeContext = createContext<DarkModeCtx>({
  dark: false,
  toggle: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);
