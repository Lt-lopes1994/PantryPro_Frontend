import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | PantryPro",
  description: "Faça login no PantryPro",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">PantryPro</h1>
          <p className="text-amber-700 mt-1">Gerencie seu restaurante</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
