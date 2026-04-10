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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-background pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[max(1.5rem,env(safe-area-inset-top,0px))] text-foreground">
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
