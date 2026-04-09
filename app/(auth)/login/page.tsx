import { redirect } from "next/navigation";
import BrandMark from "@/components/brand/BrandMark";
import LoginForm from "@/components/auth/LoginForm";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/home");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 text-foreground">
      <div className="flex justify-center">
        <BrandMark size="xl" priority className="shadow-sm" />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-center text-xl font-semibold">Connexion</h1>
        <LoginForm />
      </div>
    </div>
  );
}
