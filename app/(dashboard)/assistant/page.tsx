import Sidebar from "@/components/layout/Sidebar";
import AssistantPage from "@/components/assistant/AssistantPage";

export default function AssistantRoute() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-10 sm:px-8">
        <AssistantPage />
      </main>
    </div>
  );
}
