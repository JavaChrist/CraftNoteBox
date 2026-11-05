import { redirect } from "next/navigation";
import AuthScreen from "@/components/auth/AuthScreen";
import LoginForm from "@/components/auth/LoginForm";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const user = await getServerUser();
  if (user) {
    redirect("/home");
  }

  const { error } = await searchParams;

  return (
    <AuthScreen title="Connexion">
      <LoginForm authError={error === "auth"} />
    </AuthScreen>
  );
}
