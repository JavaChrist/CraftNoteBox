import InboxPlaceholder from "@/components/inbox/InboxPlaceholder";

export default function InboxRoute() {
  return (
    <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
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
  );
}
