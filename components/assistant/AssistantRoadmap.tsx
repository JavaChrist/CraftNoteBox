const ITEMS = [
  "Résumé automatique à l’issue d’une réunion (fichier audio / notes liées).",
  "Aide à la préparation et à la mise en forme des comptes rendus récurrents.",
  "Suggestions contextuelles pendant la rédaction (sans interrompre le flux).",
  "Génération à partir de plusieurs pages ou blocs sélectionnés.",
] as const;

export default function AssistantRoadmap() {
  return (
    <section className="space-y-3" aria-labelledby="assistant-roadmap-title">
      <h2
        id="assistant-roadmap-title"
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        Évolutions possibles
      </h2>
      <p className="text-sm text-muted-foreground">
        JavaChrist est pensé pour évoluer avec CraftNoteBox. Pistes envisageables
        (aucune date engagée) :
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/70">
        {ITEMS.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </section>
  );
}
