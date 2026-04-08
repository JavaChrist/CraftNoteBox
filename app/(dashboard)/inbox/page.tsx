import Sidebar from "@/components/layout/Sidebar";
import InboxPlaceholder from "@/components/inbox/InboxPlaceholder";

export default function InboxRoute() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Boîte de réception
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Messages
            </h1>
          </div>
          <InboxPlaceholder />
        </div>
      </main>
    </div>
  );
}
