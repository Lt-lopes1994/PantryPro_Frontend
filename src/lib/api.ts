import { apiClient } from "./axios";

// Types
export interface Restaurant {
  id: number;
  bussinesName: string;
  fantasyName: string;
  address: string;
  taxId: string;
  status: string;
}

export interface CreateRestaurant {
  bussinesName: string;
  fantasyName: string;
  address: string;
  phone?: string;
  taxId: string;
}

export interface StockItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  unit?: Unit;
  category?: Category;
  supplier?: Supplier;
}

export interface CreateStockItem {
  restaurantId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  unitId?: number;
  categoryId?: number;
  supplierId?: number;
}

export interface CreateStockMovement {
  stockItemId: number;
  type: "IN" | "OUT" | "ADJUSTMENT" | "EXPIRED" | "DAMAGED";
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
}

export interface Purchase {
  id: number;
  invoiceNumber: string | null;
  orderNumber: string | null;
  status: string;
  finalValue: number;
  orderDate: string;
  receivedDate: string | null;
  supplier: Supplier;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: number;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  totalPrice: number;
  stockItem: StockItem;
}

export interface CreatePurchase {
  supplierId: number;
  restaurantId: number;
  orderNumber?: string;
  invoiceNumber?: string;
  discount?: number;
  tax?: number;
  freight?: number;
  notes?: string;
  items: { stockItemId: number; quantityOrdered: number; unitPrice: number }[];
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  category: string;
}

export interface CreateUnit {
  name: string;
  symbol: string;
  category: string;
  baseUnit?: boolean;
  conversionFactor?: number;
}

export interface Supplier {
  id: number;
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
}

export interface CreateSupplier {
  name: string;
  fantasyName?: string;
  taxId: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CreateCategory {
  name: string;
  description?: string;
  parentId?: number;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string | null;
  ingredients: string[];
  instructions: string[];
  waterCost?: number | null;
  gasCost?: number | null;
  laborCost?: number | null;
  RecipeItem: RecipeItem[];
}

export interface RecipeItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice?: number | null;
  totalValue: number;
  stockItem?: StockItem | null;
  unit?: Unit | null;
}

export interface CreateRecipeItem {
  stockItemId: number;
  itemName: string;
  quantity: number;
  unitId?: number;
  unitPrice?: number;
}

export interface CreateRecipe {
  name: string;
  description?: string;
  restaurantId: number;
  ingredients?: string[];
  instructions?: string[];
  waterCost?: number;
  gasCost?: number;
  laborCost?: number;
  items: CreateRecipeItem[];
}

export interface CashPeriod {
  id: number;
  openedAt: string;
  closedAt?: string | null;
  openingBalance: number;
  closingBalance?: number | null;
  status: string;
  transactions: CashTransaction[];
}

export interface CashTransaction {
  id: number;
  type: string;
  category: string;
  value: number;
  description?: string | null;
  reference?: string | null;
  createdAt: string;
}

// Auth (rotas do backend: /api/v1/auth/*)
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { email, password });
    return data;
  },
  register: async (payload: {
    email: string;
    password: string;
    name: string;
    personalId: string;
    docType: string;
  }) => {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },
  verifyEmail: async (token: string) => {
    const { data } = await apiClient.get<{ message: string }>(
      "/auth/verify-email",
      { params: { token } }
    );
    return data;
  },
  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/refresh", { refreshToken });
    return data;
  },
};

// Restaurants
export const restaurantsApi = {
  list: async () => {
    const { data } = await apiClient.get<Restaurant[]>("/restaurants");
    return data;
  },
  get: async (id: number) => {
    const { data } = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return data;
  },
  create: async (payload: CreateRestaurant) => {
    const { data } = await apiClient.post<Restaurant>("/restaurants", payload);
    return data;
  },
};

// Stock
export const stockApi = {
  listItems: async (restaurantId: number) => {
    const { data } = await apiClient.get<StockItem[]>("/stock/items", {
      params: { restaurantId },
    });
    return data;
  },
  getItem: async (id: number, restaurantId: number) => {
    const { data } = await apiClient.get<StockItem>(`/stock/items/${id}`, {
      params: { restaurantId },
    });
    return data;
  },
  createItem: async (payload: CreateStockItem) => {
    const { data } = await apiClient.post<StockItem>("/stock/items", payload);
    return data;
  },
  updateItem: async (
    id: number,
    restaurantId: number,
    payload: Partial<StockItem>
  ) => {
    const { data } = await apiClient.patch<StockItem>(
      `/stock/items/${id}`,
      payload,
      { params: { restaurantId } }
    );
    return data;
  },
  createMovement: async (payload: CreateStockMovement) => {
    const { data } = await apiClient.post("/stock/movements", payload);
    return data;
  },
};

// Purchases
export const purchasesApi = {
  list: async (restaurantId: number) => {
    const { data } = await apiClient.get<Purchase[]>("/purchases", {
      params: { restaurantId },
    });
    return data;
  },
  get: async (id: number, restaurantId: number) => {
    const { data } = await apiClient.get<Purchase>(`/purchases/${id}`, {
      params: { restaurantId },
    });
    return data;
  },
  create: async (payload: CreatePurchase) => {
    const { data } = await apiClient.post<Purchase>("/purchases", payload);
    return data;
  },
  receive: async (
    id: number,
    restaurantId: number,
    items: { purchaseItemId: number; quantityReceived: number }[]
  ) => {
    const { data } = await apiClient.post<Purchase>(
      `/purchases/${id}/receive`,
      { items },
      { params: { restaurantId } }
    );
    return data;
  },
};

// Units
export const unitsApi = {
  list: async (category?: string) => {
    const { data } = await apiClient.get<Unit[]>("/units", {
      params: category ? { category } : {},
    });
    return data;
  },
  create: async (payload: CreateUnit) => {
    const { data } = await apiClient.post<Unit>("/units", payload);
    return data;
  },
};

// Suppliers
export const suppliersApi = {
  list: async () => {
    const { data } = await apiClient.get<Supplier[]>("/suppliers");
    return data;
  },
  create: async (payload: CreateSupplier) => {
    const { data } = await apiClient.post<Supplier>("/suppliers", payload);
    return data;
  },
};

// Recipes
export const recipesApi = {
  list: async (restaurantId: number) => {
    const { data } = await apiClient.get<Recipe[]>("/recipes", {
      params: { restaurantId },
    });
    return data;
  },
  get: async (id: number, restaurantId: number) => {
    const { data } = await apiClient.get<Recipe>(`/recipes/${id}`, {
      params: { restaurantId },
    });
    return data;
  },
  getCost: async (id: number, restaurantId: number) => {
    const { data } = await apiClient.get(`/recipes/${id}/cost`, {
      params: { restaurantId },
    });
    return data;
  },
  create: async (payload: CreateRecipe) => {
    const { data } = await apiClient.post<Recipe>("/recipes", payload);
    return data;
  },
  delete: async (id: number, restaurantId: number) => {
    const { data } = await apiClient.delete(`/recipes/${id}`, {
      params: { restaurantId },
    });
    return data;
  },
};

// Cash Flow
export const cashFlowApi = {
  getCurrentPeriod: async (restaurantId: number) => {
    const { data } = await apiClient.get<CashPeriod | null>(
      "/cash-flow/periods/current",
      { params: { restaurantId } }
    );
    return data;
  },
  listPeriods: async (restaurantId: number, limit = 10) => {
    const { data } = await apiClient.get<CashPeriod[]>(
      "/cash-flow/periods",
      { params: { restaurantId, limit } }
    );
    return data;
  },
  openPeriod: async (restaurantId: number, openingBalance = 0) => {
    const { data } = await apiClient.post<CashPeriod>(
      "/cash-flow/periods/open",
      { restaurantId, openingBalance }
    );
    return data;
  },
  closePeriod: async (periodId: number, restaurantId: number) => {
    const { data } = await apiClient.post<CashPeriod>(
      `/cash-flow/periods/${periodId}/close`,
      {},
      { params: { restaurantId } }
    );
    return data;
  },
  addTransaction: async (
    periodId: number,
    restaurantId: number,
    payload: {
      type: "INCOME" | "EXPENSE";
      category: string;
      value: number;
      description?: string;
      reference?: string;
    }
  ) => {
    const { data } = await apiClient.post(
      `/cash-flow/periods/${periodId}/transactions`,
      payload,
      { params: { restaurantId } }
    );
    return data;
  },
};

// Categories
export const categoriesApi = {
  list: async (parentId?: number) => {
    const { data } = await apiClient.get<Category[]>("/categories", {
      params: parentId ? { parent: parentId } : {},
    });
    return data;
  },
  create: async (payload: CreateCategory) => {
    const { data } = await apiClient.post<Category>("/categories", payload);
    return data;
  },
};
