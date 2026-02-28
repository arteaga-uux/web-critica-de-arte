import { useState } from "react";
import { Link } from "react-router";
import { resenasData } from "../data/content";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLayout } from "../context/LayoutContext";

const GAP = 90;
const COL_GAP = 75;
const SPACER = 23.33;   // 2/3 de 35 (que era el anterior)

/* ── Frases breves por reseña ── */
const BRIEF: Record<string, string> = {
  "moreno-deidad": "Un culto inesperado en Jinan, con altares de jade.",
  "arrepentido": "Once años aplazando la obra. Los tratados ya son la pieza.",
  "hockney-devocion": "Pintar solo al borde del derrumbe. Agotamiento como método.",
  "han-meilin-bestias": "Medio siglo de animales que no galopan: desfilan.",
  "jin-shangyi-rostros": "El óleo europeo traducido al realismo chino.",
  "wu-weishan-bronce": "El escultor del Estado y los bocetos que nunca aprobaron.",
};

/* ── Column ── */

function ResenaCol({ r, colSize }: { r: (typeof resenasData)[0]; colSize: number }) {
  const [hov, setHov] = useState(false);
  const c = hov ? "#888" : "var(--vitul-text)";

  return (
    <Link
      to={`/resenas/${r.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textDecoration: "none",
        flex: "0 0 auto",
        width: colSize,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Image — square, same size as ArticlePage cover */}
      <div style={{ width: colSize, height: colSize, flexShrink: 0, overflow: "hidden" }}>
        <ImageWithFallback
          src={r.imagen}
          alt={r.exposicion}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* spacer */}
      <div style={{ height: SPACER, flexShrink: 0 }} />

      {/* Text */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 400,
            fontSize: "1.05rem",
            letterSpacing: "0.06em",
            color: c,
            margin: 0,
            marginBottom: "0.35rem",
            transition: "color .2s",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          {r.exposicion}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: "1.36rem",
            lineHeight: 1.05,
            color: c,
            margin: 0,
            marginBottom: "calc(0.25rem + 10px)",
            textDecorationLine: hov ? "underline" : "none",
            textDecorationColor: "var(--vitul-underline)",
            textDecorationThickness: "0.7px",
            textUnderlineOffset: "5px",
            textDecorationSkipInk: "auto",
            transition: "color .2s",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          {r.autora}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            lineHeight: "1.7rem",
            fontWeight: 700,
            color: c,
            margin: 0,
            transition: "color .2s",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          {BRIEF[r.id] ?? ""}
        </p>
      </div>
    </Link>
  );
}

/* ── Row of 3 (one viewport section) ── */

function ResenaRow({ items }: { items: (typeof resenasData) }) {
  const { logoBottomY, entrevistaNavRightX } = useLayout();
  const contentTop = (logoBottomY > 0 ? Math.round(logoBottomY - 45 + 20) : 100) + 92;
  /* Altura de imagen = misma que portada en ArticlePage */
  const imgHeight = entrevistaNavRightX > 0 ? entrevistaNavRightX : 420;

  return (
    <div
      style={{
        height: "calc(100vh - 45px)",
        flexShrink: 0,
        scrollSnapAlign: "start",
        boxSizing: "border-box",
        paddingTop: contentTop,
        paddingBottom: GAP,
        paddingLeft: COL_GAP,
        paddingRight: COL_GAP,
        display: "flex",
        justifyContent: "center",
        gap: COL_GAP,
        overflow: "hidden",
      }}
    >
      {items.map((r) => (
        <ResenaCol key={r.id} r={r} colSize={imgHeight} />
      ))}
    </div>
  );
}

/* ── Page ── */

export function Resenas() {
  /* Split into rows of 3 */
  const rows: (typeof resenasData)[] = [];
  for (let i = 0; i < resenasData.length; i += 3) {
    rows.push(resenasData.slice(i, i + 3));
  }

  return (
    <div
      style={{
        /* Background covers everything — no gaps possible */
        backgroundColor: "var(--vitul-bg)",
      }}
    >
      {rows.map((row, i) => (
        <ResenaRow key={i} items={row} />
      ))}
    </div>
  );
}