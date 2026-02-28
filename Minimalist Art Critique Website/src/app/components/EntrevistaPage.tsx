import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router";
import { entrevistasData } from "../data/content";
import { useLayout } from "../context/LayoutContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

/* ── Constantes ──────────────────────────────────────────── */
const NAV_H     = 45;
const PAD_RIGHT = 318;
const TOP_VPAD  = 32;

export function EntrevistaPage() {
  const { id } = useParams();
  const {
    setLogoVisible, setArticleScrolled,
    logoBottomY, searchNavLeftX, entrevistaNavRightX,
  } = useLayout();

  /* cardDims: imagen A4 retrato, ancho = entrevistaNavRightX */
  const [cardDims, setCardDims] = useState(() => {
    const vpH = window.innerHeight;
    const h   = (vpH - 45 - 50 - 120) / 2;
    return { h: Math.round(h), w: Math.round(h * 4 / 3) };
  });

  /* ── Refs ── */
  const scrolledOnceRef = useRef(false);
  const isSnappingRef   = useRef(false);
  const logoTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollDivRef    = useRef<HTMLDivElement>(null);
  const articleRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgDivRefs      = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Layout ── */
  const imgTopPad = logoBottomY > 0 ? Math.round(logoBottomY - NAV_H + 20) : TOP_VPAD + 25;
  const flexGap   = Math.max(0, (searchNavLeftX || cardDims.w + 80) - cardDims.w) + 50;

  /* ── cardDims desde entrevistaNavRightX (A4 retrato) ── */
  useEffect(() => {
    const calc = () => {
      if (entrevistaNavRightX > 0) {
        const w = entrevistaNavRightX;
        const h = Math.round(w * 297 / 210);
        setCardDims({ w, h });
      } else {
        const vpH = window.innerHeight;
        const h   = (vpH - 45 - 50 - 120) / 2;
        setCardDims({ h: Math.round(h), w: Math.round(h * 4 / 3) });
      }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [entrevistaNavRightX]);

  /* ════════════════════════════════════════════════════════════
     STICKY POR POSICIÓN
     
     Comportamiento:
     • Imagen N está fija en Y = S (stickyTop).
     • Cuando el artículo N+1 empieza a entrar por abajo, la imagen N
       empieza a subir a la misma velocidad que baja el scroll, y la
       imagen N+1 sube desde el borde inferior a la misma velocidad.
     • En el momento en que la imagen N+1 llega a Y = S, se fija ahí.
     • Caso especial: si la siguiente imagen empieza a entrar antes de
       que la actual haya llegado a S, simplemente sigue subiendo.
     
     T[N] = scrollTop cuando el artículo N+1 entra por la parte inferior
          = articleTops[N+1] − vpH
     
     Para imagen N:
       si N==0 y st ≤ T[0]: y = S (fija)
       si N==0 y st > T[0]:  y = S − (st − T[0]) (se va)
       si N>0 y st < T[N−1]: y = vpH (fuera de pantalla abajo)
       si N>0:
         rawY = vpH − (st − T[N−1])   ← sube desde abajo a vel.1:1
         si st ≥ T[N]:                 ← "leaving" antes de llegar a S
           yAtNextT = max(S, vpH − (T[N] − T[N−1]))
           y = yAtNextT − (st − T[N])
         si no:
           y = max(S, rawY)            ← se fija en S al llegar
  ════════════════════════════════════════════════════════════ */
  const computeYPositions = useCallback(() => {
    const el = scrollDivRef.current;
    if (!el) return;

    const vpH   = el.clientHeight;
    const st    = el.scrollTop;
    const S     = imgTopPad;
    const count = entrevistasData.length;

    const elRect = el.getBoundingClientRect();
    const tops   = articleRefs.current.map((ref) => {
      if (!ref) return 0;
      return ref.getBoundingClientRect().top - elRect.top + st;
    });

    /* T[i] = scrollTop cuando el artículo i+1 entra por el borde inferior */
    const T: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      T[i] = tops[i + 1] - vpH;
    }

    for (let n = 0; n < count; n++) {
      const div   = imgDivRefs.current[n];
      if (!div) continue;

      const prevT = n > 0         ? T[n - 1] : -Infinity;
      const nextT = n < count - 1 ? T[n]     : Infinity;

      let y: number;

      if (n === 0) {
        y = st <= nextT
          ? S
          : S - (st - nextT);
      } else {
        if (st < prevT) {
          y = vpH; // fuera de pantalla por abajo
        } else {
          const rawY = vpH - (st - prevT);
          if (st >= nextT) {
            /* "leaving" antes de haberse fijado: continúa subiendo */
            const yAtNextT = Math.max(S, vpH - (nextT - prevT));
            y = yAtNextT - (st - nextT);
          } else {
            y = Math.max(S, rawY); /* se fija al llegar a S */
          }
        }
      }

      div.style.top = `${y}px`;
    }
  }, [imgTopPad]);

  /* Recalcular al cambiar imgTopPad o cardDims */
  useEffect(() => {
    const t = setTimeout(computeYPositions, 80);
    return () => clearTimeout(t);
  }, [computeYPositions, cardDims]);

  /* ── Snap to line ── */
  const snapToLine = useCallback(() => {
    const el = scrollDivRef.current;
    if (!el || el.scrollTop < 10) return;
    const elRect = el.getBoundingClientRect();
    const paras  = Array.from(el.querySelectorAll<HTMLElement>("p[data-body]"));
    for (const p of paras) {
      const pRect  = p.getBoundingClientRect();
      const topOff = pRect.top - elRect.top;
      if (topOff <= 0 && topOff + pRect.height > 0) {
        const lh    = parseFloat(window.getComputedStyle(p).lineHeight) || 28;
        const phase = Math.round((-topOff) % lh);
        if (phase < 2 || phase > lh - 2) return;
        const corr  = phase <= lh / 2 ? -phase : lh - phase;
        isSnappingRef.current = true;
        el.scrollTo({ top: el.scrollTop + corr, behavior: "smooth" });
        setTimeout(() => { isSnappingRef.current = false; }, 500);
        return;
      }
    }
  }, []);

  /* ── Scroll master ── */
  useEffect(() => {
    const el = scrollDivRef.current;
    if (!el) return;
    scrolledOnceRef.current = false;

    const onScrollEnd = () => { if (!isSnappingRef.current) snapToLine(); };
    const onScroll    = () => {
      if (isSnappingRef.current) return;
      computeYPositions();
      const st = el.scrollTop;
      if (st < 5) {
        if (scrolledOnceRef.current) {
          scrolledOnceRef.current = false;
          if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
          setLogoVisible(false);
          logoTimerRef.current = setTimeout(() => {
            setArticleScrolled(false);
            setLogoVisible(true);
          }, 420);
        }
        return;
      }
      if (!scrolledOnceRef.current) {
        scrolledOnceRef.current = true;
        setLogoVisible(false);
        logoTimerRef.current = setTimeout(() => {
          setArticleScrolled(true);
          setLogoVisible(true);
        }, 420);
      }
    };

    el.addEventListener("scroll",    onScroll,    { passive: true });
    el.addEventListener("scrollend", onScrollEnd, { passive: true });
    return () => {
      el.removeEventListener("scroll",    onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
      if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    };
  }, [snapToLine, computeYPositions, setLogoVisible, setArticleScrolled]);

  /* ── Scroll al artículo objetivo al montar ── */
  useEffect(() => {
    if (!id) return;
    const targetIdx = entrevistasData.findIndex((e) => e.id === id);
    if (targetIdx <= 0) return;
    const t = setTimeout(() => {
      const el  = scrollDivRef.current;
      const sec = articleRefs.current[targetIdx];
      if (!el || !sec) return;
      const offset = sec.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
      el.scrollTop = offset;
      scrolledOnceRef.current = true;
      setArticleScrolled(true);
    }, 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ── RENDER ── */
  return (
    <div style={{
      height: `calc(100vh - ${NAV_H}px)`,
      scrollSnapAlign: "start",
      flexShrink: 0,
      overflow: "hidden",
      backgroundColor: "var(--vitul-bg)",
      position: "relative",
    }}>

      {/* ── Panel izquierdo de imágenes (absoluto, no scrollea) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: cardDims.w,
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 2,
      }}>
        {entrevistasData.map((entrevista, idx) => (
          <div
            key={entrevista.id}
            ref={(el) => { imgDivRefs.current[idx] = el; }}
            style={{
              position: "absolute",
              left: 0,
              /* posición inicial: imagen 0 en stickyTop, el resto fuera abajo */
              top: idx === 0 ? imgTopPad : 9999,
              width: cardDims.w,
              height: cardDims.h,
              overflow: "hidden",
              willChange: "top",
            }}
          >
            <ImageWithFallback
              src={entrevista.imagen}
              alt={entrevista.nombre}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center top",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Scroll container (sólo texto) ── */}
      <div
        ref={scrollDivRef}
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: cardDims.w + flexGap,
          right: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          paddingRight: PAD_RIGHT,
          paddingBottom: 120,
          boxSizing: "border-box",
        }}
      >
        {entrevistasData.map((entrevista, idx) => {
          const art        = entrevista as typeof entrevista & { content?: string; title?: string; entrevistadora?: string };
          const paragraphs = (art.content ?? "").split("\n\n").filter(Boolean);

          return (
            <div
              key={entrevista.id}
              ref={(el) => { articleRefs.current[idx] = el; }}
              style={{ borderTop: idx > 0 ? "1px solid var(--vitul-text)" : "none" }}
            >
              {/* Fade superior */}
              <div style={{
                position: "sticky", top: 0, height: 0,
                zIndex: 5, pointerEvents: "none", overflow: "visible",
              }}>
                <div style={{
                  height: 36,
                  background: "linear-gradient(to bottom, var(--vitul-bg) 0%, transparent 100%)",
                }} />
              </div>

              {/* Título */}
              <h1 style={{
                fontFamily: "var(--font-title)",
                fontWeight: 700, fontStyle: "italic",
                fontSize: "1.46rem", lineHeight: 1.0,
                color: "var(--vitul-text)",
                margin: 0,
                marginTop: idx === 0 ? imgTopPad : imgTopPad * 1.5,
                marginBottom: "0.8rem",
              }}>
                {art.title ?? entrevista.nombre}
              </h1>

              {/* Entrevistadora */}
              <p style={{
                fontFamily: "var(--font-title)",
                fontWeight: 400, fontSize: "0.96rem",
                letterSpacing: "0.03em",
                color: "var(--vitul-text)",
                margin: 0, marginBottom: "1.6rem",
              }}>
                {art.entrevistadora ?? `Entrevista a ${entrevista.nombre}`}
              </p>

              {/* Separador */}
              <div style={{
                height: 3,
                backgroundColor: "var(--vitul-text)",
                opacity: 0.18,
                marginBottom: "2.4rem",
              }} />

              {/* Párrafos Q&A */}
              {paragraphs.map((block, i) => {
                const isQ = block.trimStart().startsWith("—");
                return (
                  <p
                    key={`${entrevista.id}-p-${i}`}
                    data-body="true"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: isQ ? 400 : 700,
                      fontStyle:  isQ ? "italic" : "normal",
                      fontSize: "1.0rem",
                      lineHeight: "1.3rem",
                      color: "var(--vitul-text)",
                      opacity: isQ ? 0.65 : 1,
                      margin: 0,
                      marginBottom: "2rem",
                      paddingLeft: isQ ? 0 : "1.5rem",
                      paddingBottom: i === paragraphs.length - 1 ? "4rem" : 0,
                    }}
                  >
                    {block}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}