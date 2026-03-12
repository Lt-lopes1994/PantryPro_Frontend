import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Cadastro | PantryPro",
  description: "Crie sua conta no PantryPro",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">PantryPro</h1>
          <p className="text-amber-700 mt-1">Crie sua conta</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
