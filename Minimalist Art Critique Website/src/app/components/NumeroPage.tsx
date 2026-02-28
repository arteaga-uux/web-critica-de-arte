import { useParams, useNavigate } from "react-router";
import { numerosData } from "../data/content";

export function NumeroPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const numero = numerosData.find((n) => n.id === id);

  if (!numero) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16">
        <p>Número no encontrado</p>
        <button
          onClick={() => navigate("/numeros")}
          className="underline mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "calc(100vh - 500px)",
          left: 0,
          width: "100vw",
          height: "420px",
          display: "flex",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "50vw",
            height: "420px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={numero.cover ?? numero.image}
            alt={numero.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          style={{
            flex: 1,
            height: "420px",
            display: "flex",
            flexDirection: "column",
            paddingLeft: "4rem",
            paddingRight: "2rem",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              paddingBottom: "2.5rem",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-title)",
                fontWeight: 700,
                fontSize: "1.95rem",
                fontStyle: "italic",
              }}
            >
              {numero.title}
            </h1>
            <p
              style={{
                marginTop: "1rem",
                fontFamily: "var(--font-title)",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "1.3rem",
              }}
            >
              {numero.date}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              textAlign: "center",
              fontFamily: "var(--font-serif)",
            }}
          >
            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: "1.75rem",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
              }}
            >
              {numero.summary}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          top: "calc(100vh - 50px)",
          left: "calc(50vw + 4rem)",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate("/numeros")}
          style={{ fontFamily: "var(--font-sans)", opacity: 0.5 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
        >
          ← Volver
        </button>
      </div>
    </>
  );
}