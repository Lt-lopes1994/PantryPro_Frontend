import { CashFlowClient } from "@/components/cash-flow/CashFlowClient";

export const metadata = {
  title: "Fluxo de Caixa | PantryPro",
  description: "Controle de despesas e entradas",
};

export default function CashFlowPage() {
  return <CashFlowClient />;
}
