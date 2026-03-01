const RULES = [
  {
    title: "No llegar tarde",
    description:
      "Siempre estar 15 minutos antes del horario acordado. Estar listos y a tiempo.",
  },
  {
    title: "Esfuerzo y sacrificio",
    description:
      "No alcanza con hacerlo uno, sino también ocuparse de que los compañeros lo hagan.",
  },
  {
    title: "Energía positiva",
    description: "Dar mensajes de aliento y no críticas.",
  },
  {
    title: "Ser coachable",
    description: "Estar dispuesto a escuchar y recibir críticas constructivas.",
  },
  {
    title: "Respeto en todo y con todos",
    description:
      "Con amigos, compañeros, entrenadores, árbitros y en todos los ambientes.",
  },
  {
    title: "Buena comunicación",
    description:
      "Informar sobre lesiones, cuestiones personales o complicaciones para entrenar.",
  },
  {
    title: "Estudiar y aprender rápido",
    description:
      "Ver videos, leer material y aprovechar el tiempo de entrenamiento.",
  },
  {
    title: "Hacer las cosas bien",
    description: "Sobre todo cuando nadie nos mira.",
  },
];

export function Home() {
  return (
    <main className="min-h-screen bg-navy p-8">
      <section className="space-y-8">
        <div className="flex gap-2">
          <h1 className="text-h1 text-ink text-6xl">2026 LTRC</h1>
          <p className="text-h3 text-muted text-6xl">Reglas de Convivencia</p>
        </div>
        {RULES.map((rule, index) => (
          <div key={rule.title} className="flex gap-4 items-start">
            {/* Número */}
            <span className="text-xl font-bold text-interactive">{index + 1}.</span>

            {/* Texto */}
            <div className="space-y-1">
              <h3 className="font-semibold text-ink uppercase">{rule.title}</h3>

              <p className="text-body text-muted">{rule.description}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
