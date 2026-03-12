# Mapeamento de Rotas: Frontend ↔ Backend (pantrypro)

Base URL do backend: `NEXT_PUBLIC_API_URL` (ex: `http://localhost:3000/api/v1` ou `https://pantrypro-backend.onrender.com/api/v1`)

## Auth
| Frontend (api.ts) | Backend (NestJS) | Método |
|-------------------|------------------|--------|
| `/auth/login` | `POST /auth/login` | ✓ |
| `/auth/register` | `POST /auth/register` | ✓ |
| `/auth/verify-email?token=` | `GET /auth/verify-email?token=` | ✓ |
| `/auth/refresh` | `POST /auth/refresh` | ✓ |

**Register payload:** `{ email, password, name, personalId, docType }`  
**docType:** CPF, CNPJ, SSN, VAT ou EIN

## Restaurantes
| Frontend | Backend | Método |
|----------|---------|--------|
| `/restaurants` | `/restaurants` | GET, POST |
| `/restaurants/:id` | `/restaurants/:id` | GET, PATCH, DELETE |

## Estoque
| Frontend | Backend | Método |
|----------|---------|--------|
| `/stock/items?restaurantId=` | `/stock/items?restaurantId=` | GET |
| `/stock/items` | `/stock/items` | POST |
| `/stock/items/:id?restaurantId=` | `/stock/items/:id?restaurantId=` | GET, PATCH, DELETE |
| `/stock/movements` | `/stock/movements` | POST |

## Compras
| Frontend | Backend | Método |
|----------|---------|--------|
| `/purchases?restaurantId=` | `/purchases?restaurantId=` | GET |
| `/purchases` | `/purchases` | POST |
| `/purchases/:id?restaurantId=` | `/purchases/:id?restaurantId=` | GET, PATCH, DELETE |
| `/purchases/:id/receive?restaurantId=` | `/purchases/:id/receive?restaurantId=` | POST |

## Receitas
| Frontend | Backend | Método |
|----------|---------|--------|
| `/recipes?restaurantId=` | `/recipes?restaurantId=` | GET |
| `/recipes` | `/recipes` | POST |
| `/recipes/:id?restaurantId=` | `/recipes/:id?restaurantId=` | GET, DELETE |
| `/recipes/:id/cost?restaurantId=` | `/recipes/:id/cost?restaurantId=` | GET |

## Fluxo de Caixa
| Frontend | Backend | Método |
|----------|---------|--------|
| `/cash-flow/periods/open` | `/cash-flow/periods/open` | POST |
| `/cash-flow/periods/current?restaurantId=` | `/cash-flow/periods/current?restaurantId=` | GET |
| `/cash-flow/periods?restaurantId=&limit=` | `/cash-flow/periods?restaurantId=&limit=` | GET |
| `/cash-flow/periods/:id/close?restaurantId=` | `/cash-flow/periods/:id/close?restaurantId=` | POST |
| `/cash-flow/periods/:id/transactions?restaurantId=` | `/cash-flow/periods/:id/transactions?restaurantId=` | POST |

## Cadastros (Unidades, Fornecedores, Categorias)
| Frontend | Backend | Método |
|----------|---------|--------|
| `/units?category=` | `/units?category=` | GET |
| `/units` | `/units` | POST |
| `/suppliers` | `/suppliers` | GET, POST |
| `/categories?parent=` | `/categories?parent=` | GET |
| `/categories` | `/categories` | POST |
