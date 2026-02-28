import { useState } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLayout } from "../context/LayoutContext";
import { entrevistasData } from "../data/content";

export const entrevistas = entrevistasData;

const NAV_H      = 45;
const TEXT_PAD_H = 90;
const TEXT_PAD_V = 55;

function EntrevistaCard({
  e,
  imgW,
  imgH,
  textLeftX,
}: {
  e: (typeof entrevistas)[0];
  imgW: number;
  imgH: number;
  textLeftX: number;
}) {
  const [hov, setHov] = useState(false);
  const c = hov ? "#888" : "var(--vitul-text)";

  return (
    <Link
      to={`/entrevistas/${e.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "row",
        flexShrink: 0,
        height: imgH,
      }}
    >
      {/* Imagen A4 retrato — ancho = borde derecho de "entrevistas" en la nav */}
      <div style={{ width: imgW, height: imgH, flexShrink: 0, overflow: "hidden" }}>
        <ImageWithFallback
          src={e.imagen}
          alt={e.nombre}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            display: "block",
          }}
        />
      </div>

      {/* Texto — borde izquierdo alineado con el borde derecho de "entrevistas" en la nav */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: `max(0px, calc(${textLeftX}px - ${imgW}px))`,
          paddingRight: TEXT_PAD_H,
          paddingTop: TEXT_PAD_V,
          paddingBottom: TEXT_PAD_V,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Título */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <p style={{
            fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.36rem",
            letterSpacing: "0.05em", color: c, margin: 0, transition: "color 0.2s",
          }}>
            Entrevista a
          </p>
          <h2 style={{
            fontFamily: "var(--font-title)", fontWeight: 700, fontStyle: "italic",
            fontSize: "1.47rem", lineHeight: 1.05, color: c, margin: 0,
            textDecorationLine: hov ? "underline" : "none",
            textDecorationColor: "var(--vitul-underline)", textDecorationThickness: "0.7px",
            textUnderlineOffset: "5px", textDecorationSkipInk: "auto", transition: "color 0.2s",
          }}>
            {e.nombre}
          </h2>
          <p style={{
            fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "0.85rem",
            letterSpacing: "0.06em", color: c, margin: 0, transition: "color 0.2s",
          }}>
            {e.fecha}
          </p>
        </div>

        {/* Descripción */}
        <p style={{
          fontFamily: "var(--font-serif)", fontSize: "1rem", lineHeight: "1.65",
          fontWeight: 700, color: c, margin: 0, maxWidth: 560, transition: "color 0.2s",
        }}>
          {e.resumen}
        </p>
      </div>
    </Link>
  );
}

export function Entrevistas() {
  const { entrevistaNavRightX, logoBottomY } = useLayout();

  // Ancho de imagen = borde derecho de "entrevistas" en la nav
  const imgW = entrevistaNavRightX > 0 ? entrevistaNavRightX : 340;
  // Alto = A4 apaisado (210/297 × ancho) — ancho > alto
  const imgH = Math.round(imgW * 210 / 297);
  // Borde izquierdo del texto = mismo punto de referencia
  const textLeftX = imgW;
  // Distancia superior = misma que en Últimos (logoBottomY - NAV_H + 20)
  const contentTop = logoBottomY > 0 ? Math.round(logoBottomY - NAV_H + 20) : 50;

  return (
    <div style={{ backgroundColor: "var(--vitul-bg)" }}>
      {entrevistas.map((e) => (
        <div
          key={e.id}
          style={{
            height: `calc(100vh - ${NAV_H}px)`,
            flexShrink: 0,
            scrollSnapAlign: "start",
            paddingTop: contentTop,
            boxSizing: "border-box",
            overflow: "hidden",
            backgroundColor: "var(--vitul-bg)",
          }}
        >
          <EntrevistaCard e={e} imgW={imgW} imgH={imgH} textLeftX={textLeftX} />
        </div>
      ))}
    </div>
  );
}