import AuthScreen from "@/components/auth/AuthScreen";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <AuthScreen title="Mot de passe oublié">
      <ForgotPasswordForm linkError={error === "lien"} />
    </AuthScreen>
  );
}
