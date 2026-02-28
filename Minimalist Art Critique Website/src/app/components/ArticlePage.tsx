import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router";
import { resenasData } from "../data/content";
import { useLayout } from "../context/LayoutContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

/* ── Constantes ──────────────────────────────────────────── */
const NAV_H      = 45;
const PAD_RIGHT  = 318;
const TOP_VPAD   = 32;

/* ── Imágenes extra por artículo ─────────────────────────── */
const ARTICLE_EXTRA_IMAGES: Record<string, string[]> = {
  "moreno-deidad": [
    "https://images.unsplash.com/photo-1766234908232-f7e8da734799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYXRhZ29uaWElMjBnbGFjaWVyJTIwQXJnZW50aW5hJTIwd2lsZGVybmVzc3xlbnwxfHx8fDE3NzE4NDQ5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1666002832699-8fe20966e5d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwbWFwcyUyMGNvbXBhc3MlMjBleHBsb3JhdGlvbiUyMGFydGlmYWN0c3xlbnwxfHx8fDE3NzE4NDQ5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ],
  "arrepentido": [
    "https://images.unsplash.com/photo-1719530648635-0766e15bfbbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXB0dWFsJTIwYXJ0JTIwZW1wdHklMjBjaGFpciUyMGluc3RhbGxhdGlvbiUyMGdhbGxlcnl8ZW58MXx8fHwxNzcxODUyNDM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1765188987649-556278abd405?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaW5rJTIwYnJ1c2glMjBhYnN0cmFjdCUyMHBhaW50aW5nJTIwc3R1ZGlvfGVufDF8fHx8MTc3MTc3OTg5NHww&ixlib=rb-4.1.0&q=80&w=1080",
  ],
  "hockney-devocion": [
    "https://images.unsplash.com/photo-1674133749176-d2aa8860798b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaW5rJTIwYWJzdHJhY3QlMjBwYWludGluZyUyMHN0dWRibyUyMGNhbnZhc3xlbnwxfHx8fDE3NzE4NTI0Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1645733963074-fa742c0cd9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBleGhhdXN0ZWQlMjBwYWludGluZyUyMGxhcmdlJTIwY2FudmFzJTIwdGV4dHVyZSUyMGNsb3NlfGVufDF8fHx8MTc3MTg1MjQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  ],
};

/* ── Articles with full content (feed order) ─────────────── */
const articles = resenasData.filter((a) => !!(a as { content?: string }).content);

export function ArticlePage() {
  const { id }       = useParams();
  const {
    setLogoVisible, setArticleScrolled,
    logoBottomY, entrevistaNavRightX, searchNavLeftX,
  } = useLayout();

  const [stickyTop, setStickyTop] = useState(0);

  /* ── Logo refs ── */
  const scrolledOnceRef = useRef(false);
  const isSnappingRef   = useRef(false);
  const logoTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── DOM refs ── */
  const scrollDivRef  = useRef<HTMLDivElement>(null);
  const sepRef        = useRef<HTMLDivElement>(null);           // first sep → stickyTop
  const articleRefs   = useRef<(HTMLDivElement | null)[]>([]);  // article tops
  const rightColRefs  = useRef<(HTMLDivElement | null)[]>([]);  // per-article right col
  // imgSecRefs[aIdx][imgIdx] — bounds the sticky zone per image
  const imgSecRefs2D  = useRef<(HTMLDivElement | null)[][]>(articles.map(() => []));
  // imgDivRefs[aIdx][imgIdx] — the sticky image wrapper (opacity manipulated directly)
  const imgDivRefs2D  = useRef<(HTMLDivElement | null)[][]>(articles.map(() => []));

  /* ── Layout measures ── */
  const imgTopPad = logoBottomY > 0 ? Math.round(logoBottomY - NAV_H + 20) : TOP_VPAD + 25;
  const imgW      = entrevistaNavRightX || 420;
  const flexGap   = Math.max(20, (searchNavLeftX || imgW + 80) - imgW) + 50;

  /* ── Measure stickyTop (from first article's separator) ── */
  useEffect(() => {
    const measure = () => {
      const el  = scrollDivRef.current;
      const sep = sepRef.current;
      if (!el || !sep) return;
      const st = Math.round(sep.getBoundingClientRect().top - el.getBoundingClientRect().top);
      if (st > 0) setStickyTop(st);
    };
    const t = setTimeout(measure, 120);
    const ro = new ResizeObserver(measure);
    if (rightColRefs.current[0]) ro.observe(rightColRefs.current[0]);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [imgTopPad, imgW]);

  /* ── Sync imgSec heights per article ──
     Divides each article's right-column height equally across its images
     so that each image "owns" an equal third of the scroll distance.         */
  useEffect(() => {
    const sync = () => {
      articles.forEach((art, aIdx) => {
        const rc   = rightColRefs.current[aIdx];
        if (!rc) return;
        const totalH = rc.offsetHeight;
        const imgs   = imgSecRefs2D.current[aIdx] || [];
        if (!imgs.length) return;
        const perSec = Math.max(imgW, Math.round(totalH / imgs.length));
        imgs.forEach((is) => { if (is) is.style.minHeight = `${perSec}px`; });
      });
    };
    const ro = new ResizeObserver(sync);
    rightColRefs.current.forEach((rc) => { if (rc) ro.observe(rc); });
    sync();
    return () => ro.disconnect();
  }, [imgW]);

  /* ── updateOpacities: crossfade per article (independent) ──
     No opacity loss from top clipping — only fades when next image enters.  */
  const updateOpacities = useCallback(() => {
    const el = scrollDivRef.current;
    if (!el) return;
    const elRect = el.getBoundingClientRect();
    const vpH    = el.clientHeight;

    articles.forEach((_, aIdx) => {
      const divs  = imgDivRefs2D.current[aIdx] || [];
      const count = divs.length;
      if (!count) return;

      const prog: number[] = [];
      for (let i = 0; i < count - 1; i++) {
        const next = divs[i + 1];
        if (!next) { prog.push(0); continue; }
        const nextTop = next.getBoundingClientRect().top - elRect.top;
        prog.push(Math.max(0, Math.min(1, (vpH - nextTop) / imgW)));
      }

      for (let i = 0; i < count; i++) {
        const d = divs[i];
        if (!d) continue;
        let op: number;
        if (count === 1)          op = 1;
        else if (i === 0)         op = 1 - prog[0];
        else if (i === count - 1) op = prog[i - 1];
        else                      op = prog[i - 1] * (1 - prog[i]);
        d.style.opacity = String(Math.max(0, Math.min(1, op)));
      }
    });
  }, [imgW]);

  useEffect(() => { updateOpacities(); }, [stickyTop, updateOpacities]);

  /* ── Snap-to-line ── */
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
        const corr = phase <= lh / 2 ? -phase : lh - phase;
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
      updateOpacities();
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
  }, [snapToLine, updateOpacities, setLogoVisible, setArticleScrolled]);

  /* ── Scroll to target article on mount ── */
  useEffect(() => {
    if (!id) return;
    const targetIdx = articles.findIndex((a) => a.id === id);
    if (targetIdx <= 0) return;
    const t = setTimeout(() => {
      const el  = scrollDivRef.current;
      const sec = articleRefs.current[targetIdx];
      if (!el || !sec) return;
      const offset = sec.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
      el.scrollTop = offset;
      /* Trigger logo vertical mode since we're mid-feed */
      scrolledOnceRef.current = true;
      setArticleScrolled(true);
    }, 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ── RENDER ── */
  const stFallback = stickyTop || imgTopPad;

  return (
    <div style={{
      height: `calc(100vh - ${NAV_H}px)`,
      scrollSnapAlign: "start", flexShrink: 0,
      overflow: "hidden",
      backgroundColor: "var(--vitul-bg)",
      position: "relative",
    }}>

      {/* ── Scroll container ── */}
      <div
        ref={scrollDivRef}
        style={{
          height: "100%", overflowY: "auto",
          overscrollBehavior: "contain",
          paddingLeft: 0, paddingRight: PAD_RIGHT,
          paddingTop: 0, paddingBottom: 120,
          boxSizing: "border-box",
        }}
      >
        {articles.map((article, aIdx) => {
          const art        = article as typeof article & { content?: string; visita?: string };
          const paragraphs = (art.content ?? "").split("\n\n").filter(Boolean);
          const visitaText = art.visita ?? "";
          const extraImgs  = ARTICLE_EXTRA_IMAGES[article.id] ?? [];
          const allImages  = [article.imagen, ...extraImgs];
          const numImgs    = allImages.length;
          const secSize    = Math.max(1, Math.ceil(paragraphs.length / numImgs));
          const paraSecs   = allImages.map((_, i) =>
            paragraphs.slice(i * secSize, (i + 1) * secSize)
          );

          /* Ensure 2D ref arrays exist for this article */
          if (!imgSecRefs2D.current[aIdx]) imgSecRefs2D.current[aIdx] = [];
          if (!imgDivRefs2D.current[aIdx]) imgDivRefs2D.current[aIdx] = [];

          return (
            <div
              key={article.id}
              ref={(el) => { articleRefs.current[aIdx] = el; }}
              style={{
                /* Subtle top separator between articles in the feed */
                borderTop: aIdx > 0 ? "1px solid var(--vitul-text)" : "none",
                opacity: 1,
              }}
            >
              {/* ══ Dos columnas ══ */}
              <div style={{ display: "flex", gap: flexGap, alignItems: "flex-start" }}>

                {/* ─── IZQUIERDA: imágenes ─────────────── */}
                <div style={{ flexShrink: 0, width: imgW }}>
                  {allImages.map((src, imgIdx) => (
                    <div
                      key={`${article.id}-sec-${imgIdx}`}
                      ref={(el) => { imgSecRefs2D.current[aIdx][imgIdx] = el; }}
                      style={{ position: "relative" }}
                    >
                      <div
                        ref={(el) => { imgDivRefs2D.current[aIdx][imgIdx] = el; }}
                        style={{
                          position: "sticky",
                          top: stFallback,
                          width: imgW,
                          height: imgW,
                          overflow: "hidden",
                          opacity: imgIdx === 0 ? 1 : 0,
                        }}
                      >
                        <ImageWithFallback
                          src={src}
                          alt={`${article.exposicion} — imagen ${imgIdx + 1}`}
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "cover", objectPosition: "center",
                            display: "block",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ─── DERECHA: texto ──────────────────── */}
                <div
                  ref={(el) => { rightColRefs.current[aIdx] = el; }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {/* Fade top — solo sobre columna de texto, una por artículo */}
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
                    marginTop: aIdx === 0 ? imgTopPad : imgTopPad * 1.5,
                    marginBottom: "0.8rem",
                  }}>
                    {article.exposicion}
                  </h1>

                  {/* Autor */}
                  <p style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 700, fontStyle: "italic",
                    fontSize: "1.25382rem",
                    letterSpacing: "0.03em",
                    color: "var(--vitul-text)",
                    margin: 0, marginBottom: "1.6rem",
                  }}>
                    {article.autora}
                  </p>

                  {/* Separador — sólo el primero mide stickyTop */}
                  <div
                    ref={aIdx === 0 ? sepRef : undefined}
                    style={{
                      height: 3,
                      backgroundColor: "var(--vitul-text)",
                      opacity: 0.18,
                      marginBottom: "2.4rem",
                    }}
                  />

                  {/* Párrafos divididos en secciones */}
                  {paraSecs.map((section, sIdx) => {
                    const isLastSec = sIdx === paraSecs.length - 1;
                    return (
                      <div key={`${article.id}-tsec-${sIdx}`}>
                        {section.map((text, pIdx) => (
                          <p
                            key={`${article.id}-p-${sIdx}-${pIdx}`}
                            data-body="true"
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontWeight: 700,
                              fontSize: "1.0rem",
                              lineHeight: "1.3rem",
                              color: "var(--vitul-text)",
                              margin: 0,
                              marginBottom: "2rem",
                            }}
                          >
                            {text}
                          </p>
                        ))}

                        {/* Visita al final */}
                        {isLastSec && visitaText && (
                          <p style={{
                            fontFamily: "var(--font-title)",
                            fontWeight: 400, fontSize: "0.66rem",
                            letterSpacing: "0.03em",
                            color: "var(--vitul-text)",
                            opacity: 0.55,
                            textAlign: "right",
                            margin: 0, marginTop: "1.2rem",
                            paddingBottom: "4rem",
                          }}>
                            {visitaText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}