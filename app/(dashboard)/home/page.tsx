import Sidebar from "@/components/layout/Sidebar";
import HomeCards from "@/components/home/HomeCards";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Accueil
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Bienvenue sur CraftNoteBox
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choisis une zone pour continuer — la navigation principale est aussi
              disponible dans la barre latérale.
            </p>
          </div>
          <HomeCards />
        </div>
      </main>
    </div>
  );
}
