import { createContext, useContext } from "react";

export interface LayoutCtx {
  logoBottomY: number;
  setLogoBottomY: (y: number) => void;
  entrevistaNavRightX: number;
  setEntrevistaNavRightX: (x: number) => void;
  numerosNavLeftX: number;
  setNumerosNavLeftX: (x: number) => void;
  resenasNavLeftX: number;
  setResenasNavLeftX: (x: number) => void;
  /** Left edge of the "ú" in "últimos" nav item */
  ultimosNavLeftX: number;
  setUltimosNavLeftX: (x: number) => void;
  /** Left edge of search icon (lupita) — left boundary of text column */
  searchNavLeftX: number;
  setSearchNavLeftX: (x: number) => void;
  setLogoVisible: (v: boolean) => void;
  articleScrolled: boolean;
  setArticleScrolled: (v: boolean) => void;
}

export const LayoutContext = createContext<LayoutCtx>({
  logoBottomY: 0,
  setLogoBottomY: () => {},
  entrevistaNavRightX: 0,
  setEntrevistaNavRightX: () => {},
  numerosNavLeftX: 0,
  setNumerosNavLeftX: () => {},
  resenasNavLeftX: 0,
  setResenasNavLeftX: () => {},
  ultimosNavLeftX: 0,
  setUltimosNavLeftX: () => {},
  searchNavLeftX: 0,
  setSearchNavLeftX: () => {},
  setLogoVisible: () => {},
  articleScrolled: false,
  setArticleScrolled: () => {},
});

export const useLayout = () => useContext(LayoutContext);