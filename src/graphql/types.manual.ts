// src/graphql/types.manual.ts

/** ==== Common scalar aliases (Vendure uses ints for money in minor units) ==== */
export type ID = string;
export type Money = number;

/** ==== Active Order (subset that your UI uses) ==== */
export interface ActiveOrderLine {
  id: ID;
  unitPriceWithTax: Money;
  quantity: number;
  linePriceWithTax: Money;
  productVariant: {
    id: ID;
    name: string;
    sku: string;
    product: {
      slug: string;
    };
  };
  featuredAsset?: {
    id: ID;
    preview: string;
  } | null;
}

export interface ActiveOrder {
  id: ID;
  code: string;
  taxSummary?: { description: string; taxTotal: Money }[] | null;
  payments?: Array<{
    transactionId?: string | null;
    state: string;
    amount: Money;
    customFields?: any;
    metadata?: any;
  }> | null;
  couponCodes?: string[] | null;
  customer?: { emailAddress?: string | null } | null;
  state: string;
  currencyCode: string;
  totalQuantity: number;
  subTotalWithTax: Money;
  shippingWithTax?: Money | null;
  totalWithTax: Money;
  discounts?: Array<{ description: string; amountWithTax: Money }> | null;
  lines: ActiveOrderLine[];
  shippingLines?: Array<{
    shippingMethod?: { description?: string | null } | null;
    priceWithTax: Money;
  }> | null;
}

/** ==== Query results ==== */
export interface GetActiveOrderData {
  activeOrder: ActiveOrder | null;
}

/** ==== Mutations: Add Item to Order ==== */
export interface AddItemToOrderMutationVariables {
  productVariantId: ID;
  quantity: number;
}

// Vendure returns a union; model the parts you actually branch on.
export interface ErrorResult {
  errorCode: string;
  message: string;
}
export interface InsufficientStockError {
  quantityAvailable: number;
  order: ActiveOrder;
}

export interface AddItemToOrderMutation {
  addItemToOrder: ActiveOrder | ErrorResult | InsufficientStockError;
}

/** ==== Mutations: Adjust Order Line ==== */
export interface AdjustOrderLineMutationVariables {
  orderLineId: ID;
  quantity: number;
}

export interface AdjustOrderLineMutation {
  adjustOrderLine: ActiveOrder | ErrorResult;
}
