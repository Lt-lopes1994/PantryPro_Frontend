"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Restaurant, restaurantsApi } from "@/lib/api";
import { useAuth } from "./auth-context";

interface RestaurantContextType {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (r: Restaurant | null) => void;
  loadRestaurants: () => Promise<void>;
  isLoading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRestaurants = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await restaurantsApi.list();
      setRestaurants(data);
      if (data.length > 0) {
        const saved = typeof window !== "undefined" && localStorage.getItem("current_restaurant_id");
        const r = saved ? data.find((x) => x.id === +saved) : data[0];
        setCurrentRestaurantState(r || data[0]);
      }
    } catch {
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const setCurrentRestaurant = useCallback((r: Restaurant | null) => {
    setCurrentRestaurantState(r);
    if (r && typeof window !== "undefined") {
      localStorage.setItem("current_restaurant_id", String(r.id));
    }
  }, []);

  useEffect(() => {
    if (token) loadRestaurants();
  }, [token, loadRestaurants]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        currentRestaurant,
        setCurrentRestaurant,
        loadRestaurants,
        isLoading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
}
