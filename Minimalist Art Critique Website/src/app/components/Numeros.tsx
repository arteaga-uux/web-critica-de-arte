import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import coverImage1 from "figma:asset/dcccb5422ce10fce3bf98c646c2385801d8eb1dc.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLayout } from "../context/LayoutContext";

const A4_RATIO = 210 / 297;
const A4H_CSS = `calc(100vh - 174px)`;
const A4W_CSS = `calc((100vh - 174px) * ${A4_RATIO.toFixed(5)})`;
const COLW_CSS = `calc((100vh - 209px) * ${(A4_RATIO * 1.44).toFixed(5)} - 140px)`;
// Col 1 fija en 500px; el aire ganado queda libre a la derecha del índice
const COL1_W = 500;

/* ─── Data ──────────────────────────────────────────────── */

export const numeros = [
  {
    id: "1",
    issue: "DOSSIER Nº1",
    title: "LA NEGACIÓN DEL ARTE",
    date: "JUNIO 2026",
    summary:
      "El arte contemporáneo atraviesa una crisis de legitimidad sin precedentes. En este número inaugural, VITUL propone una lectura crítica de los mecanismos por los cuales el sistema del arte niega, absorbe y finalmente neutraliza cualquier gesto de ruptura. Reunimos textos, imágenes y conversaciones que interrogan el valor de la negación como acto estético y político. ¿Puede el arte seguir siendo subversivo cuando la institución lo abraza? ¿Qué queda del gesto crítico cuando el mercado lo cotiza? Partimos de la hipótesis de que la negación ha dejado de ser una estrategia de resistencia para convertirse en el lenguaje oficial del sistema. La provocación se ha domesticado, la transgresión cotiza en alza y el escándalo alimenta las ruedas de prensa. Frente a este panorama, los textos reunidos aquí no proponen una salida sino una cartografía del problema.",
    index: [
      "Iker Bastida — La negación como programa y sus consecuencias institucionales",
      "Carmen Leal — Contra la autonomía del arte",
      "Martín Urquijo — Conversación sobre el vacío",
      "Elena Ferretti — Arte postal, estrategias de fuga y la imposibilidad del archivo",
      "Roberto Navas — La institución devora su crítica",
      "Sofía Alarcón — Mercado y negatividad",
      "Pablo Ríos — Lo que ya no puede verse",
    ],
  },
  {
    id: "0",
    issue: "DOSSIER Nº0",
    title: "DUENDES Y POLICÍAS",
    date: "DICIEMBRE 2025",
    summary:
      "Hay dos fuerzas que organizan el arte contemporáneo hoy y ninguna de ellas es estética. La primera es el duende: esa potencia oscura, irracional y terrestre que Lorca identificó como la única fuente de arte verdadero. La segunda es la policía: el aparato institucional, curatorial y discursivo que administra lo que puede mostrarse, decirse y sentirse dentro del perímetro del arte legítimo. La agenda progresista globalista no es una ideología entre otras —es la forma que adopta la policía cuando quiere parecer liberación. Regula el gesto antes de que ocurra, traduce la pulsión en protocolo, domestica la rabia en programa. El duende, por definición, no pide permiso.",
    index: [
      "Lena Brandt — El duende como categoría crítica y su supervivencia institucional",
      "Marcos Isla — La policía estética: genealogía de un aparato",
      "Vera Santini — Identidad, curaduría y el fin del gesto incontrolable",
      "André Melo — Arte en la era de la auditoría moral",
      "Cristina Pou — Lo que el duende no puede ser traducido",
      "Joaquín Aldaz — Ferias, fondos y la globalización del buen gusto",
      "Rosa Fern — Contra la diversidad administrada",
    ],
  },
];

/* ─── Shared dossier header (0.8× scale, used in Numeros + Ultimos) ── */

export function DossierHeader({ numero }: { numero: { issue: string; title: string; date: string } }) {
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.33rem",
        lineHeight: 1.2, letterSpacing: "0.08em", color: "var(--vitul-text)",
        margin: 0, marginBottom: "0.6rem",
      }}>
        {numero.issue}
      </p>
      <h2 style={{
        fontFamily: "var(--font-title)", fontWeight: 700, fontStyle: "italic",
        fontSize: "1.186rem", lineHeight: 1.08, color: "var(--vitul-text)",
        margin: 0, marginBottom: "0.8rem",
      }}>
        {numero.title}
      </h2>
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 700, fontSize: "0.76rem",
        letterSpacing: "0.06em", color: "var(--vitul-text)", margin: 0,
      }}>
        {numero.date}
      </p>
    </div>
  );
}

/* ─── Index item ────────────────────────────────────────── */

function IndexItem({ line, dark }: { line: string; dark?: boolean }) {
  const [hovered, setHovered] = useState(false);
  // dark=true → fixed ink colors (magazine interior, always light bg)
  // dark=false/undefined → CSS vars (cover overlay, mode-aware)
  const baseColor = dark ? "#1a1a1a" : "var(--vitul-text)";
  const hoverColor = dark ? "#888" : "var(--vitul-text)";
  return (
    <p
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1rem",
        lineHeight: "1.7rem",
        fontWeight: 700,
        color: hovered ? hoverColor : baseColor,
        opacity: !dark && hovered ? 0.45 : 1,
        textDecorationLine: hovered ? "underline" : "none",
        textDecorationColor: dark ? "#1a1a1a" : "var(--vitul-text)",
        textDecorationThickness: "0.7px",
        textUnderlineOffset: "5px",
        textDecorationSkipInk: "auto",
        transition: "color 0.2s, opacity 0.2s",
        margin: 0,
        cursor: "pointer",
      }}
    >
      {line}
    </p>
  );
}

/* ─── Magazine page components ──────────────────────────── */

const PAGE_BG = "#f4f3ee";
const INK = "#1a1a1a";
const PP = "48px 60px 0 60px"; // padding inside page

function PageRule({ label, pageNum }: { label?: string; pageNum?: string }) {
  return (
    <div
      style={{
        borderTop: `1px solid rgba(0,0,0,0.13)`,
        paddingTop: 9,
        marginBottom: 38,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          color: INK,
          opacity: 0.38,
        }}
      >
        {label || "VITUL"}
      </span>
      {pageNum && (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "0.6rem",
            letterSpacing: "0.06em",
            color: INK,
            opacity: 0.38,
          }}
        >
          {pageNum}
        </span>
      )}
    </div>
  );
}

function MagPage({
  children,
  onClick,
  canClick,
  side,
}: {
  children: React.ReactNode;
  onClick: () => void;
  canClick: boolean;
  side: "left" | "right";
}) {
  return (
    <div
      onClick={canClick ? onClick : undefined}
      style={{
        width: "50%",
        height: "100%",
        backgroundColor: PAGE_BG,
        boxSizing: "border-box",
        overflow: "hidden",
        cursor: canClick ? (side === "left" ? "w-resize" : "e-resize") : "default",
        display: "flex",
        flexDirection: "column",
        padding: PP,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

/* individual page content layouts */

function PageIndex({ numero }: { numero: (typeof numeros)[0] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageRule label="VITUL — ÍNDICE" pageNum="02" />
      <p
        style={{
          fontFamily: "var(--font-title)",
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: "1.482rem",
          lineHeight: 1.08,
          color: INK,
          margin: 0,
          marginBottom: "auto",
        }}
      >
        Índice
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.7rem", marginTop: "auto", paddingBottom: 48 }}>
        {numero.index.map((line) => (
          <IndexItem key={line} line={line} dark />
        ))}
      </div>
    </div>
  );
}

function PageEditorial({ numero }: { numero: (typeof numeros)[0] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <PageRule label="EDITORIAL" pageNum="03" />
        <p style={{ fontFamily: "var(--font-title)", fontWeight: 400, fontSize: "1.6625rem", lineHeight: 1.2, letterSpacing: "0.08em", color: INK, margin: 0, marginBottom: "0.75rem" }}>
          {numero.issue}
        </p>
        <h2 style={{ fontFamily: "var(--font-title)", fontWeight: 700, fontStyle: "italic", fontSize: "1.482rem", lineHeight: 1.08, color: INK, margin: 0, marginBottom: "1rem" }}>
          {numero.title}
        </h2>
        <p style={{ fontFamily: "var(--font-title)", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.06em", color: INK, margin: 0 }}>
          {numero.date}
        </p>
      </div>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.92rem", lineHeight: "1.64rem", fontWeight: 700, color: INK, margin: 0, paddingBottom: 48 }}>
        {numero.summary}
      </p>
    </div>
  );
}

function PageArticleOpener({ author, title, pages, accent }: { author: string; title: string; pages: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <PageRule pageNum={pages} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "10%" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.1em", color: INK, opacity: 0.45, margin: 0, marginBottom: "1.4rem" }}>
          {author.toUpperCase()}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: accent ? "2.6rem" : "2.1rem",
            lineHeight: 1.06,
            color: INK,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.13)", paddingTop: 9, paddingBottom: 48 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.7rem", letterSpacing: "0.06em", color: INK, opacity: 0.4 }}>
          pp. {pages}
        </span>
      </div>
    </div>
  );
}

function PageBody({ text, pageNum, label }: { text: string; pageNum: string; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageRule label={label} pageNum={pageNum} />
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "0.9rem",
          lineHeight: "1.62rem",
          fontWeight: 700,
          color: INK,
          margin: 0,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {text}
      </p>
    </div>
  );
}

function PageConversation({ items, pageNum }: { items: { q: string; a: string; name: string }[]; pageNum: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageRule label="CONVERSACIÓN" pageNum={pageNum} />
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", overflow: "hidden" }}>
        {items.map((item, i) => (
          <div key={i}>
            <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.1em", color: INK, opacity: 0.45, margin: 0, marginBottom: "0.35rem" }}>
              P. —
            </p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", lineHeight: "1.58rem", fontWeight: 700, color: INK, margin: 0, marginBottom: "0.5rem", fontStyle: "italic" }}>
              {item.q}
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.1em", color: INK, opacity: 0.45, margin: 0, marginBottom: "0.35rem" }}>
              {item.name.toUpperCase()} —
            </p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", lineHeight: "1.58rem", fontWeight: 700, color: INK, margin: 0 }}>
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageTwoOpeners({ items, pageNum }: { items: { author: string; title: string; pages: string }[]; pageNum: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <PageRule pageNum={pageNum} />
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: i < items.length - 1 ? "2.2rem" : 0 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.66rem", letterSpacing: "0.1em", color: INK, opacity: 0.4, margin: 0, marginBottom: "0.4rem" }}>
              {item.author.toUpperCase()}
            </p>
            <h3 style={{ fontFamily: "var(--font-title)", fontWeight: 700, fontStyle: "italic", fontSize: "1.25rem", lineHeight: 1.08, color: INK, margin: 0, marginBottom: "0.3rem" }}>
              {item.title}
            </h3>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.68rem", letterSpacing: "0.06em", color: INK, opacity: 0.38 }}>pp. {item.pages}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Arrow button — lives INSIDE the spread ────────────── */

function ArrowBtn({ dir, onClick, visible }: { dir: "left" | "right"; onClick: () => void; visible: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [dir]: 0,
        width: 72,
        background: "none",
        border: "none",
        cursor: visible ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: "31px",
        lineHeight: "31px",
        letterSpacing: "-0.04em",
        color: INK,
        opacity: !visible ? 0 : hov ? 0.55 : 0.18,
        transition: "opacity 0.15s",
        zIndex: 10,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}

/* ─── PDF Spread ────────────────────────────────────────── */

const spreadVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "5%" : dir < 0 ? "-5%" : 0, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-5%" : dir < 0 ? "5%" : 0, opacity: 0 }),
};

function PdfSpread({ numero, onClose }: { numero: (typeof numeros)[0]; onClose: () => void }) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState(0);
  const [closeHov, setCloseHov] = useState(false);
  const spreadRef = useRef(currentSpread);
  spreadRef.current = currentSpread;

  // Build spreads for this número
  const spreads: Array<{ left: React.ReactNode; right: React.ReactNode }> = [
    // 0 — Índice + Editorial
    {
      left: <PageIndex numero={numero} />,
      right: <PageEditorial numero={numero} />,
    },
    // 1 — Iker Bastida (opener + body)
    {
      left: <PageArticleOpener author="Iker Bastida" title="La negación como programa y sus consecuencias institucionales" pages="08–22" accent />,
      right: <PageBody pageNum="09" label="IKER BASTIDA" text="La negación se ha convertido en el programa por defecto del arte contemporáneo. Lo que comenzó como gesto disruptivo —en Dadá, en el conceptualismo, en las prácticas institucionales de los años setenta— ha devenido en protocolo obligatorio. La institución no sólo tolera la negación: la requiere. El comisario que no cuestiona nada es sospechoso. La obra que afirma sin reservas es ingenua. El artista que celebra sin ironía es provincial.\n\nLa negación se ha vuelto tan prescriptiva como cualquier otra retórica estética. Tiene sus géneros canónicos, sus figuras tutelares, sus museos de referencia, su mercado —y vaya si lo tiene. Las piezas que 'cuestionan el sistema' se venden por sumas obscenas en las mismas ferias que pretenden cuestionar. El gesto de rechazo es hoy la firma más rentable.\n\n¿Qué significa esto para la práctica artística? Significa que el artista que niega no está ya fuera del sistema sino en su centro. La transgresión es el producto estrella. El escándalo es la publicidad. Y lo verdaderamente transgresor —la afirmación, la belleza, el oficio, el placer desinteresado— ha quedado relegado al margen: como lo que no puede decirse en el perímetro del arte legítimo." />,
    },
    // 2 — Carmen Leal (opener + body)
    {
      left: <PageArticleOpener author="Carmen Leal" title="Contra la autonomía del arte" pages="23–35" />,
      right: <PageBody pageNum="24" label="CARMEN LEAL" text="La autonomía del arte fue siempre una ficción necesaria. Necesaria porque sin esa separación imaginaria del mundo —sin ese 'como si el arte fuese otra cosa'— no habría espacio para la experiencia estética propiamente dicha. Ficción porque el arte nunca dejó de estar atravesado por el dinero, el poder, las instituciones y las ideologías de su tiempo.\n\nLo que ha cambiado no es que el arte sea dependiente —siempre lo fue— sino que ahora la dependencia se ha vuelto explícita y reivindicada como virtud política. El arte contemporáneo no pretende ya ser autónomo. Se declara comprometido, situado, político, comunitario, interseccional. Habla sin pudor de sus condiciones de producción. Denuncia sus propios mecanismos de legitimación.\n\nY en este gesto de transparencia radical se vuelve, paradójicamente, más opaco que nunca. Porque la obra que exhibe sus cadenas no las ha roto. Las ha tematizado. Y tematizar las cadenas es exactamente lo que el sistema necesita para seguir funcionando con la conciencia tranquila." />,
    },
    // 3 — Martín Urquijo (conversación)
    {
      left: <PageConversation pageNum="36" items={[
        {
          name: "Martín Urquijo",
          q: "Has escrito que el vacío es la única categoría estética que todavía resiste la instrumentalización. ¿Qué significa eso exactamente?",
          a: "Que el vacío no puede ser llenado de contenido sin destruirse a sí mismo. La institución puede apropiarse de la provocación, del conflicto, incluso del silencio —el silencio ha terminado siendo un género bien definido. Pero el vacío real, el que no es metáfora sino experiencia directa, no admite curaduría.",
        },
        {
          name: "Martín Urquijo",
          q: "¿Puede darse ese vacío todavía en el arte?",
          a: "Rarísimas veces. Cuando ocurre, nadie sabe muy bien qué hacer con ello. La crítica tartamudea. Los coleccionistas dudan. Es la única señal de que algo ha pasado de verdad.",
        },
      ]} />,
      right: <PageConversation pageNum="37" items={[
        {
          name: "Martín Urquijo",
          q: "¿Y cuándo fue la última vez que lo viste?",
          a: "En una sala pequeña, en una ciudad que no tiene mucho arte. Una pintora de setenta años que no había expuesto nunca. Nada que citar, nada que referenciar. El cuadro te miraba sin pedirte nada. Eso es el vacío: cuando el arte no mendiga tu interpretación.",
        },
        {
          name: "Martín Urquijo",
          q: "¿Por qué crees que las instituciones no pueden tolerar ese vacío?",
          a: "Porque el vacío no produce discurso. Y sin discurso no hay comunicación de prensa, ni didáctica, ni programa educativo, ni catálogo, ni legacy institucional. El vacío amenaza toda la infraestructura. No por lo que dice sino por lo que calla.",
        },
      ]} />,
    },
    // 4 — Elena Ferretti (opener + body)
    {
      left: <PageArticleOpener author="Elena Ferretti" title="Arte postal, estrategias de fuga y la imposibilidad del archivo" pages="48–60" />,
      right: <PageBody pageNum="49" label="ELENA FERRETTI" text="El archivo es el lugar donde el arte va a morir ordenadamente. La institución lo sabe. El artista también lo sabe. Y sin embargo seguimos archivando.\n\nEl arte postal —correo, fluxus, acción distribuida— fue el intento más consecuente de crear un circuito sin archivo posible. La obra viajaba, se deterioraba, llegaba tarde o no llegaba. Era imposible conservarla sin traicionarla. Esa imposibilidad era exactamente su contenido.\n\nLo que queda del arte postal en los museos —sobres plastificados, catálogos de envíos, documentación fotográfica— es el fantasma de una práctica que consistía en no dejar rastro. La institución ha archivado el anti-archivo. Ha conservado la huella de lo que se negó a ser conservado. Esta es la forma definitiva de la neutralización: no destruir el gesto sino convertirlo en reliquia." />,
    },
    // 5 — Roberto Navas + Sofía Alarcón openers | Pablo Ríos
    {
      left: <PageTwoOpeners pageNum="61" items={[
        { author: "Roberto Navas", title: "La institución devora su crítica", pages: "62–72" },
        { author: "Sofía Alarcón", title: "Mercado y negatividad", pages: "73–84" },
      ]} />,
      right: <PageBody pageNum="85" label="PABLO RÍOS" text="Hay obras que no pueden verse. No porque estén prohibidas ni porque hayan desaparecido físicamente, sino porque el ojo contemporáneo ha perdido la capacidad de recibirlas. El ojo está demasiado entrenado en la lectura conceptual, en la búsqueda del comentario, en la pregunta por el contexto y las intenciones.\n\nVer una obra —verla de verdad, antes del discurso— requiere una disponibilidad que el arte contemporáneo lleva décadas desalentando. Nos ha enseñado a preguntar qué significa antes de experimentar qué produce. Y en ese orden invertido se pierde algo irreparable.\n\nLo que ya no puede verse no está en ningún archivo. Está en el espacio entre la obra y el espectador, en ese segundo anterior a la traducción, cuando todavía no sabemos qué nombre darle a lo que sentimos." />,
    },
  ];

  const totalSpreads = spreads.length;
  const canGoNext = currentSpread < totalSpreads - 1;
  const canGoPrev = currentSpread > 0;

  const goNext = () => {
    if (spreadRef.current < totalSpreads - 1) {
      setDirection(1);
      setCurrentSpread((c) => c + 1);
    }
  };
  const goPrev = () => {
    if (spreadRef.current > 0) {
      setDirection(-1);
      setCurrentSpread((c) => c - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      key="pdf-spread"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(0, 0, 14, 0.91)",
      }}
      onClick={onClose}
    >
      {/* Close — top left, same typography as nav */}
      <button
        onClick={onClose}
        onMouseEnter={() => setCloseHov(true)}
        onMouseLeave={() => setCloseHov(false)}
        style={{
          position: "absolute",
          top: 11,
          left: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "24px",
          letterSpacing: "-0.04em",
          color: "#d4d4e8",
          padding: "5px 10px",
          opacity: closeHov ? 1 : 0.55,
          transition: "opacity 0.15s",
          zIndex: 20,
        }}
      >
        ✕
      </button>

      {/* Spread — fills full height, 100px sides. Margins are pure close-zone */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 100,
          right: 100,
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentSpread}
            custom={direction}
            variants={spreadVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
            }}
          >
            {/* Left page — click = prev */}
            <MagPage side="left" onClick={goPrev} canClick={canGoPrev}>
              {spreads[currentSpread].left}
            </MagPage>

            {/* Spine */}
            <div
              style={{
                width: 1,
                flexShrink: 0,
                backgroundColor: "rgba(0,0,0,0.09)",
                zIndex: 5,
              }}
            />

            {/* Right page — click = next */}
            <MagPage side="right" onClick={goNext} canClick={canGoNext}>
              {spreads[currentSpread].right}
            </MagPage>
          </motion.div>
        </AnimatePresence>

        {/* Arrows inside the spread, on page edges */}
        <ArrowBtn dir="left" onClick={goPrev} visible={canGoPrev} />
        <ArrowBtn dir="right" onClick={goNext} visible={canGoNext} />
      </div>
    </motion.div>
  );
}

/* ─── NumeroBlock (text col + cover + index col) ────────── */

function NumeroBlock({
  numero,
  coverSrc,
  coverUnsplash,
  pdfOpen,
  onPdfOpen,
}: {
  numero: (typeof numeros)[0];
  coverSrc?: string;
  coverUnsplash?: string;
  pdfOpen: boolean;
  onPdfOpen: () => void;
}) {
  const [coverHovered, setCoverHovered] = useState(false);
  const [pdfBtnHovered, setPdfBtnHovered] = useState(false);

  useEffect(() => {
    if (pdfOpen) setCoverHovered(false);
  }, [pdfOpen]);

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "57px" }}>
      {/* Col 1: portada — flush al borde izquierdo */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{ width: A4W_CSS, height: A4H_CSS, cursor: "pointer", position: "relative" }}
          onMouseEnter={() => !pdfOpen && setCoverHovered(true)}
          onMouseLeave={() => setCoverHovered(false)}
          onClick={() => { setCoverHovered(false); onPdfOpen(); }}
        >
          {/* Imagen — se oscurece al 50% en hover */}
          <div style={{ position: "absolute", inset: 0, opacity: coverHovered ? 0.5 : 1, transition: "opacity 0.35s ease", backgroundColor: "#f0f0f0" }}>
            {coverSrc ? (
              <img src={coverSrc} alt={numero.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            ) : (
              <ImageWithFallback src={coverUnsplash!} alt={numero.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            )}
          </div>
        </div>
      </div>

      {/* Col 2: texto dossier */}
      <Link to={`/numeros/${numero.id}`} style={{ textDecoration: "none", display: "block", flexShrink: 0 }}>
        <div
          style={{
            width: COL1_W,
            height: A4H_CSS,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <DossierHeader numero={numero} />
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", lineHeight: "1.7rem", fontWeight: 700, color: "var(--vitul-text)", margin: 0 }}>
            {numero.summary}
          </p>
        </div>
      </Link>

      {/* Col 3: índice + botón descargar pdf */}
      <div style={{
        width: 470,
        paddingLeft: 0,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: A4H_CSS,
      }}>
        {/* Índice + botón — enrasados con el borde inferior de la portada */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.7rem" }}>
            {numero.index.map((line) => (
              <IndexItem key={line} line={line} />
            ))}
          </div>
          {/* Botón descargar pdf */}
          <button
            onClick={onPdfOpen}
            onMouseEnter={() => setPdfBtnHovered(true)}
            onMouseLeave={() => setPdfBtnHovered(false)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "24px",
              letterSpacing: "-0.04em",
              color: pdfBtnHovered ? "#dc0050" : "var(--vitul-text)",
              opacity: 1,
              transition: "color 0.15s",
              textAlign: "left",
              /* Alineación: última línea del índice = antepenúltima línea del texto
                 Fórmula: marginTop = 2×lineHeight_desc − height_button
                 lineHeight_desc = 1.7rem, button height = 24px             */
              marginTop: "calc(3.4rem - 24px)",
            }}
          >
            descargar pdf
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── NumeroEntry ──────────────────────────────────────── */

function NumeroEntry({ numero, coverSrc, coverUnsplash }: { numero: (typeof numeros)[0]; coverSrc?: string; coverUnsplash?: string }) {
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <>
      <NumeroBlock numero={numero} coverSrc={coverSrc} coverUnsplash={coverUnsplash} pdfOpen={pdfOpen} onPdfOpen={() => setPdfOpen(true)} />
      <AnimatePresence>
        {pdfOpen && <PdfSpread numero={numero} onClose={() => setPdfOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────── */

export function Numeros() {
  const { logoBottomY } = useLayout();
  // Misma distancia logo→contenido que en Últimos (20px)
  const contentTop = logoBottomY > 0 ? Math.round(logoBottomY - 45 + 20) : 50;

  return (
    <div style={{ backgroundColor: "var(--vitul-bg)" }}>
      <div style={{ height: "calc(100vh - 45px)", flexShrink: 0, scrollSnapAlign: "start", boxSizing: "border-box", display: "flex", alignItems: "flex-start", paddingLeft: 0, paddingTop: contentTop, paddingBottom: 70 }}>
        <NumeroEntry numero={numeros[0]} coverSrc={coverImage1} />
      </div>
      <div style={{ height: "calc(100vh - 45px)", flexShrink: 0, scrollSnapAlign: "start", boxSizing: "border-box", display: "flex", alignItems: "flex-start", paddingLeft: 0, paddingTop: contentTop, paddingBottom: 70 }}>
        <NumeroEntry
          numero={numeros[1]}
          coverUnsplash="https://images.unsplash.com/photo-1547322617-3f783b07f999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwY29udGVtcG9yYXJ5JTIwYXJ0JTIwZXhoaWJpdGlvbiUyMG1pbmltYWx8ZW58MXx8fHwxNzcxNjk4NTkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
        />
      </div>
    </div>
  );
}