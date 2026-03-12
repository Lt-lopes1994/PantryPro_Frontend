import { RestaurantsClient } from "@/components/restaurants/RestaurantsClient";

export const metadata = {
  title: "Restaurantes | PantryPro",
  description: "Gerencie seus restaurantes",
};

export default function RestaurantsPage() {
  return <RestaurantsClient />;
}
