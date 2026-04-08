import AssistantHero from "@/components/assistant/AssistantHero";
import AssistantQuickActions from "@/components/assistant/AssistantQuickActions";
import AssistantCapabilities from "@/components/assistant/AssistantCapabilities";
import AssistantRoadmap from "@/components/assistant/AssistantRoadmap";
import AssistantEditorCTA from "@/components/assistant/AssistantEditorCTA";

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-12">
      <AssistantHero />
      <AssistantQuickActions />
      <AssistantCapabilities />
      <AssistantEditorCTA />
      <AssistantRoadmap />
      <p className="text-center text-xs text-muted-foreground">
        Configuration serveur :{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
          OPENAI_API_KEY
        </code>
        {", "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
          OPENAI_MODEL
        </code>{" "}
        (optionnel) — voir{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
          .env.example
        </code>
        .
      </p>
    </div>
  );
}
