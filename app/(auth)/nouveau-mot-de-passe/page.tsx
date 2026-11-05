import AuthScreen from "@/components/auth/AuthScreen";
import NewPasswordForm from "@/components/auth/NewPasswordForm";

export const dynamic = "force-dynamic";

export default function NewPasswordPage() {
  return (
    <AuthScreen title="Nouveau mot de passe">
      <NewPasswordForm />
    </AuthScreen>
  );
}
