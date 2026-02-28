import { useState, useEffect, useLayoutEffect, useRef } from "react";
import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Search } from "lucide-react";
import logoImage from "figma:asset/ff8215f7bec816b88c90c55a1eca3a926e6eecbf.png";
import logoVertical from "figma:asset/fe8a7afd4d1e1bb4d2f266f74b12852cd0e8b8dc.png";
import { DarkModeContext } from "../context/DarkMode";
import { LayoutContext } from "../context/LayoutContext";

/* ── Solid colour overlay (moon / search) ── */
function HoverOverlay({ color = "var(--vitul-hover)" }: { color?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "-9999px",
        bottom: 0,
        left: 0,
        right: 0,
        background: color,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Nav item ── */

const NavItem = React.forwardRef<
  HTMLLIElement,
  { to: string; children: React.ReactNode; active: boolean; hoverColor?: string }
>(function NavItem({ to, children, active }, ref) {
  const [hovered, setHovered] = useState(false);

  return (
    <li ref={ref} style={{ position: "relative", listStyle: "none" }}>
      <Link
        to={to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "24px",
          letterSpacing: "-0.04em",
          color: hovered ? "#dc0050" : "var(--vitul-text)",
          textDecoration: "none",
          display: "block",
          padding: "5px 10px",
          position: "relative",
          zIndex: 1,
          opacity: !hovered && !active ? 0.45 : 1,
          backgroundColor: "transparent",
          transition: "color 0.15s, opacity 0.15s",
        }}
      >
        {children}
      </Link>
    </li>
  );
});

/* ── Botón luna (modo oscuro/claro) ── */
function MoonButton({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li style={{ position: "relative", listStyle: "none", marginLeft: "2px" }}>
      <button
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={dark ? "Modo claro" : "Modo oscuro"}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "5px 10px",
          position: "relative",
          zIndex: 1,
          opacity: hovered ? 1 : 0.45,
          transition: "opacity 0.15s",
        }}
      >
        {/* Crescent moon — thin & pointed */}
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill={hovered ? "#dc0050" : "var(--vitul-text)"}
          stroke="none"
          aria-hidden="true"
          style={{ transform: "rotate(-45deg)", transition: "fill 0.15s" }}
        >
          <path d="M 15.9 20.1 A 9 9 0 1 1 15.9 3.9 A 8.16 8.16 0 0 0 15.9 20.1 Z" />
        </svg>
      </button>
    </li>
  );
}

/* ── Lupa ── */
function SearchButton({ liRef }: { liRef?: React.RefObject<HTMLLIElement> }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li ref={liRef} style={{ position: "relative", listStyle: "none" }}>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "5px 10px",
          position: "relative",
          zIndex: 1,
          opacity: hovered ? 1 : 0.45,
          transition: "opacity 0.15s",
        }}
      >
        <Search size={22} strokeWidth={2.5} color={hovered ? "#dc0050" : "var(--vitul-text)"} style={{ transition: "color 0.15s" }} />
      </button>
    </li>
  );
}

export function Layout() {
  const location = useLocation();
  const [dark, setDark] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const [articleScrolled, setArticleScrolled] = useState(false);
  const [logoBottomY, setLogoBottomY] = useState(0);
  const [entrevistaNavRightX, setEntrevistaNavRightX] = useState(0);
  const [numerosNavLeftX, setNumerosNavLeftX] = useState(0);
  const [resenasNavLeftX, setResenasNavLeftX] = useState(0);
  const [ultimosNavLeftX, setUltimosNavLeftX] = useState(0);
  const [searchNavLeftX, setSearchNavLeftX] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const entrevistaNavRef = useRef<HTMLLIElement>(null);
  const numerosNavRef = useRef<HTMLLIElement>(null);
  const resenasNavRef = useRef<HTMLLIElement>(null);
  const ultimosNavRef = useRef<HTMLLIElement>(null);
  const searchBtnRef = useRef<HTMLLIElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Measure logo bottom edge whenever the image loads or window resizes */
  useEffect(() => {
    function measure() {
      if (!logoRef.current) return;
      const rect = logoRef.current.getBoundingClientRect();
      setLogoBottomY(rect.bottom);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Measure right edge of "entrevistas" nav item */
  useEffect(() => {
    function measure() {
      if (!entrevistaNavRef.current) return;
      const rect = entrevistaNavRef.current.getBoundingClientRect();
      setEntrevistaNavRightX(rect.right - 10);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Measure left edge of text in «números», «reseñas», «últimos» and search icon */
  useLayoutEffect(() => {
    function measure() {
      if (numerosNavRef.current) {
        const r = numerosNavRef.current.getBoundingClientRect();
        setNumerosNavLeftX(r.left + 10);
      }
      if (resenasNavRef.current) {
        const r = resenasNavRef.current.getBoundingClientRect();
        setResenasNavLeftX(r.left + 10);
      }
      if (ultimosNavRef.current) {
        const r = ultimosNavRef.current.getBoundingClientRect();
        setUltimosNavLeftX(r.left + 10);
      }
      if (searchBtnRef.current) {
        const r = searchBtnRef.current.getBoundingClientRect();
        setSearchNavLeftX(r.right - 10); // borde DERECHO del icono lupita
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Logo desaparece al scrollear, reaparece al fijarse en snap */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const scrollBaseRef = { current: el.scrollTop };

    const onScroll = () => {
      const currentY = el.scrollTop;
      // Solo ocultar si el desplazamiento supera 20px desde la posición de reposo
      if (Math.abs(currentY - scrollBaseRef.current) >= 20) {
        setLogoVisible(false);
      }
    };

    // scrollend se dispara cuando la animación de snap ha terminado del todo
    const onScrollEnd = () => {
      setLogoVisible(true);
      scrollBaseRef.current = el.scrollTop;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
    };
  }, []);

  /* Sync dark-mode class on <html> so CSS (not JS) controls html/body bg */
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("vitul-dark-active");
      root.style.backgroundColor = "#00001c";
      document.body.style.backgroundColor = "#00001c";
    } else {
      root.classList.remove("vitul-dark-active");
      root.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    }
  }, [dark]);

  /* Reset scroll to top on tab change */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [location.pathname]);

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  /* Páginas de artículo: subruta con id (ej. /resenas/moreno-deidad) */
  const isArticlePage = /\/(resenas|entrevistas|numeros)\/[^/]+/.test(location.pathname);

  /* Cuando se navega FUERA de un artículo, resetear INMEDIATAMENTE el estado del logo */
  useEffect(() => {
    if (!isArticlePage) {
      setArticleScrolled(false);
      setLogoVisible(true); // asegura que el logo horizontal aparezca al instante
    }
  }, [location.pathname, isArticlePage]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      <LayoutContext.Provider value={{
        logoBottomY, setLogoBottomY,
        entrevistaNavRightX, setEntrevistaNavRightX,
        numerosNavLeftX, setNumerosNavLeftX,
        resenasNavLeftX, setResenasNavLeftX,
        ultimosNavLeftX, setUltimosNavLeftX,
        searchNavLeftX, setSearchNavLeftX,
        setLogoVisible,
        articleScrolled, setArticleScrolled,
      }}>
        <div
          className={dark ? "vitul-dark" : ""}
          style={{
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--vitul-bg)",
            color: "var(--vitul-text)",
            transition: "background-color 0.3s, color 0.3s",
          }}
        >
          {/* Header */}
          <header style={{ position: "relative", zIndex: 100 }}>
            {/* Nav — se desvanece antes de llegar al logo (mask gradient) */}
            <nav style={{
              paddingTop: "11px",
              paddingBottom: "0",
              maskImage: "linear-gradient(to right, black calc(100% - 380px), transparent calc(100% - 300px))",
              WebkitMaskImage: "linear-gradient(to right, black calc(100% - 380px), transparent calc(100% - 300px))",
            }}>
              <ul
                className="flex"
                style={{ margin: 0, padding: 0, listStyle: "none", alignItems: "center" }}
              >
                {/* 🌙 Botón luna: antes de "últimos", mismo espaciado */}
                <MoonButton dark={dark} toggle={() => setDark((d) => !d)} />

                <NavItem ref={ultimosNavRef} to="/ultimos" active={isActive("/ultimos")}>últimos</NavItem>
                <NavItem ref={numerosNavRef} to="/numeros" active={isActive("/numeros")} hoverColor="#ff1f00">números</NavItem>
                <NavItem ref={resenasNavRef} to="/resenas" active={isActive("/resenas")} hoverColor="#506477">reseñas</NavItem>
                <NavItem ref={entrevistaNavRef} to="/entrevistas" active={isActive("/entrevistas")} hoverColor="#4c522e">entrevistas</NavItem>
                <NavItem to="/about"       active={isActive("/about")}       hoverColor="#9e2c4f">about</NavItem>
                <SearchButton liRef={searchBtnRef} />
              </ul>
            </nav>

            {/* Logo horizontal — siempre en DOM para medir logoBottomY; visible solo en tabs o antes del primer scroll en artículo */}
            <Link
              to="/ultimos"
              style={{
                position: "absolute",
                right: "23px",
                top: "20px",
                display: "block",
                lineHeight: 0,
                pointerEvents: (isArticlePage && articleScrolled) ? "none" : "auto",
              }}
            >
              <img
                ref={logoRef}
                src={logoImage}
                alt="VITUL"
                onLoad={() => {
                  if (!logoRef.current) return;
                  setLogoBottomY(logoRef.current.getBoundingClientRect().bottom);
                }}
                style={{
                  width: "270px",
                  height: "auto",
                  display: "block",
                  filter: dark ? "invert(1)" : "none",
                  mixBlendMode: dark ? "screen" : "multiply",
                  opacity: (!isArticlePage || !articleScrolled) && logoVisible ? 1 : 0,
                  // Sin transición al volver desde artículo: el cambio tiene que ser instantáneo
                  transition: isArticlePage ? "filter 0.3s, opacity 0.4s ease" : "filter 0.3s",
                }}
              />
            </Link>

            {/* Logo vertical — aparece solo en artículos una vez el usuario ha hecho scroll */}
            <Link
              to="/ultimos"
              style={{
                position: "absolute",
                right: "23px",
                top: "20px",
                display: "block",
                lineHeight: 0,
                pointerEvents: (isArticlePage && articleScrolled) ? "auto" : "none",
              }}
            >
              <img
                src={logoVertical}
                alt="VITUL"
                style={{
                  width: "auto",
                  height: "255px",
                  display: "block",
                  filter: dark ? "invert(1)" : "none",
                  mixBlendMode: dark ? "screen" : "multiply",
                  opacity: isArticlePage && articleScrolled && logoVisible ? 1 : 0,
                  // Transición suave solo mientras estamos EN un artículo; instantánea al salir
                  transition: isArticlePage ? "filter 0.3s, opacity 0.4s ease" : "filter 0.3s",
                }}
              />
            </Link>
          </header>

          {/* Main content */}
          <main ref={mainRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", scrollSnapType: "y mandatory" }}>
            <Outlet />
          </main>
        </div>
      </LayoutContext.Provider>
    </DarkModeContext.Provider>
  );
}