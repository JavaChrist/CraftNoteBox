import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/home");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Connexion</h1>
        <LoginForm />
      </div>
    </div>
  );
}
