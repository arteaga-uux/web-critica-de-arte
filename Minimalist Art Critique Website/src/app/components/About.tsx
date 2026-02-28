export function About() {
  return (
    <div className="max-w-4xl mx-auto px-8 pt-24 pb-16">
      <h1 className="text-4xl mb-8" style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>
        Sobre VITUL
      </h1>
      
      <div className="space-y-6" style={{ fontFamily: 'var(--font-serif)' }}>
        <p className="text-lg leading-relaxed">
          VITUL es una revista de crítica de arte contemporáneo que explora las intersecciones
          entre prácticas artísticas, teoría crítica y contextos culturales.
        </p>
        
        <p className="text-lg leading-relaxed">
          Nuestro enfoque editorial privilegia la profundidad analítica y el rigor conceptual,
          presentando ensayos, reseñas y entrevistas que contribuyen al debate sobre el arte actual.
        </p>
        
        <p className="text-lg leading-relaxed">
          Fundada en 2024, VITUL mantiene un compromiso con la excelencia editorial y el
          pensamiento crítico independiente.
        </p>
      </div>
    </div>
  );
}