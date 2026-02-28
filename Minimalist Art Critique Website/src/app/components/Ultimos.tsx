import { useState } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import coverImage1 from "figma:asset/dcccb5422ce10fce3bf98c646c2385801d8eb1dc.png";
import { numeros } from "./Numeros";
import { entrevistasData, resenasData } from "../data/content";
import { useLayout } from "../context/LayoutContext";

/* ─── Layout constants ─────────────────────────────────────── */

const NAV_H = 45;

/* ─── Reseña card: imagen arriba, texto abajo ───────────────── */

function ResenaBottomCard({ r }: { r: (typeof resenasData)[0] }) {
  const [hov, setHov] = useState(false);
  const c = hov ? "#dc0050" : "var(--vitul-text)";

  return (
    <Link
      to={`/resenas/${r.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ width: "100%", display: "flex", flexDirection: "column", textDecoration: "none" }}
    >
      {/* ① Imagen arriba */}
      <div style={{ width: "100%", aspectRatio: "1/1", flexShrink: 0, overflow: "hidden", marginBottom: 10.66 }}>
        <ImageWithFallback
          src={r.imagen}
          alt={r.exposicion}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
      </div>

      {/* ② Texto abajo */}
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.05490rem",
          letterSpacing: "0.06em", color: c,
          marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: "0.25rem",
          transition: "color 0.2s", overflowWrap: "break-word",
        }}>
          {r.exposicion}
        </p>
        <h2 style={{
          fontFamily: "var(--font-title)", fontWeight: 700, fontStyle: "italic",
          fontSize: "1.25382rem", lineHeight: 1.05, color: c, margin: 0,
          textDecorationLine: hov ? "underline" : "none",
          textDecorationColor: "var(--vitul-underline)", textDecorationThickness: "0.7px",
          textUnderlineOffset: "5px", transition: "color 0.2s", overflowWrap: "break-word",
        }}>
          {r.autora}
        </h2>
      </div>
    </Link>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export function Ultimos() {
  const lastNumero     = numeros[0];
  const lastEntrevista = entrevistasData[0];

  const { logoBottomY, entrevistaNavRightX } = useLayout();
  const TOP_VPAD  = 32;
  const imgTopPad = logoBottomY > 0 ? Math.round(logoBottomY - NAV_H + 20) : TOP_VPAD + 25;

  /* Dimensiones idénticas a Entrevistas.tsx */
  const entImgW = entrevistaNavRightX > 0 ? entrevistaNavRightX : 340;
  const entImgH = Math.round(entImgW * 210 / 297);

  const A4H_CSS = `calc(100vh - 174px)`;
  const A4W_CSS = `calc((100vh - 174px) * ${(210 / 297).toFixed(5)})`;

  return (
    <div
      style={{
        height: `calc(100vh - ${NAV_H}px)`,
        display: "flex",
        flexDirection: "row",
        backgroundColor: "var(--vitul-bg)",
        scrollSnapAlign: "start",
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ══ Col 1: Portada A4 ══ */}
      <div style={{ flexShrink: 0, paddingTop: imgTopPad }}>
        <Link
          to="/numeros"
          style={{ display: "block", width: A4W_CSS, height: A4H_CSS, overflow: "hidden" }}
        >
          <img
            src={coverImage1}
            alt={lastNumero.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          />
        </Link>
      </div>

      {/* ══ Col 2: resenasData[1] + resenasData[0] ══ */}
      <div style={{
        flexShrink: 0,
        marginLeft: 57,
        paddingTop: imgTopPad,
        paddingBottom: 129 - imgTopPad,
        width: 270,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        justifyContent: "flex-end",
        gap: 25,
      }}>
        <ResenaBottomCard r={resenasData[1]} />
        <ResenaBottomCard r={resenasData[0]} />
      </div>

      {/* ══ Col 3: resenasData[2] (Fang Lei) ══ */}
      <div style={{
        flexShrink: 0,
        marginLeft: 30,
        width: 270,
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        paddingTop: imgTopPad,
        paddingBottom: 129 - imgTopPad,
        boxSizing: "border-box",
        justifyContent: "flex-end",
        position: "relative",
      }}>
        <ResenaBottomCard r={resenasData[2]} />

        <Link
          to={`/entrevistas/${lastEntrevista.id}`}
          style={{
            position: "absolute",
            right: 0, // Alineado con el borde derecho de la imagen de la reseña
            top: imgTopPad + entImgH / 2,
            transform: "translateY(-50%)",
            textDecoration: "none",
            color: "var(--vitul-text)",
            whiteSpace: "nowrap",
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: "0.6rem",
            zIndex: 10,
          }}
        >
          <span style={{
            fontFamily: "var(--font-title)",
            fontWeight: 400,
            fontSize: "1.05490rem",
            letterSpacing: "0.06em",
          }}>
            Entrevista a
          </span>
          <span style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: "1.25382rem",
            lineHeight: 1,
          }}>
            {lastEntrevista.nombre}
          </span>
        </Link>
      </div>

      {/* ══ Imagen entrevista — absoluta, flush derecha, bajo logo VITUL ══ */}
      <Link
        to={`/entrevistas/${lastEntrevista.id}`}
        style={{
          position: "absolute",
          right: 0,
          top: imgTopPad,
          display: "block",
          width: entImgW,
          height: entImgH,
          overflow: "hidden",
        }}
      >
        <ImageWithFallback
          src={lastEntrevista.imagen}
          alt={lastEntrevista.nombre}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
      </Link>

    </div>
  );
}