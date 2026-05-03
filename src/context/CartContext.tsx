"use client";

import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import {
  GET_ACTIVE_ORDER,
  ADD_TO_CART,
  ADJUST_QUANTITY,
  REMOVE_FROM_CART,
} from "@/graphql/queries";
import {
  GetActiveOrderData,
  AddItemToOrderMutation,
  AddItemToOrderMutationVariables,
  AdjustOrderLineMutation,
  AdjustOrderLineMutationVariables,
  ActiveOrder,
} from "@/graphql/types.manual";
import { useUser } from "@/context/UserContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useSyncCartOnLogin } from "@/hooks/useSyncCartOnLogin";

type UseCartContext = {
  cart: GetActiveOrderData | undefined;
  activeOrder: ActiveOrder | null | undefined;
  getCount: () => number;
  loading: boolean;
  addToCartMutation: (variables: AddItemToOrderMutationVariables) => Promise<any>;
  handleAdjustQuantity: (orderLineId: string, quantity: number) => Promise<void>;
  removeFromCartMutation: (orderLineId: string) => Promise<void>;
  getOrderLineIdByVariantId: (variantId: string) => string | undefined;
};

const initialCtx: UseCartContext = {
  cart: undefined,
  activeOrder: undefined,
  getCount: () => 0,
  loading: false,
  addToCartMutation: async () => {},
  handleAdjustQuantity: async () => {},
  removeFromCartMutation: async () => {},
  getOrderLineIdByVariantId: () => undefined,
};

const CartContext = createContext<UseCartContext>(initialCtx);
export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }: PropsWithChildren) => {
  const { customer, loading: authLoading } = useUser();
  const { clearCart } = useLocalCart();

  // ✅ useLazyQuery instead of useQuery
  // useQuery with skip=true never re-fires when skip flips to false
  // if the component was already mounted. useLazyQuery lets us
  // manually fire the query exactly when we want it.
  const [fetchCart, { data, loading: cartLoading }] = useLazyQuery<GetActiveOrderData>(
    GET_ACTIVE_ORDER,
    { fetchPolicy: "cache-and-network" }
  );

  const prevCustomerId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const currentId = customer?.id ?? null;
    const prevId = prevCustomerId.current;

    // ✅ Only fetch when:
    // 1. Auth has resolved (customer !== undefined)
    // 2. Customer ID actually changed (login/logout transition)
    // This fires on:
    //   - Page load with existing session (undefined → "123")
    //   - Login on the page (null → "123")
    //   - Re-login after logout ("123" → null → "456")
    if (customer === undefined) return;

    if (currentId !== prevId) {
      prevCustomerId.current = currentId;

      if (currentId) {
        // Customer just logged in — fetch their cart
        fetchCart();
      }
      // If currentId is null, user logged out — cart data
      // naturally becomes undefined since we don't refetch
    }
  }, [customer, fetchCart]);

  const [addItem] = useMutation<AddItemToOrderMutation>(ADD_TO_CART, {
    refetchQueries: [{ query: GET_ACTIVE_ORDER }],
    awaitRefetchQueries: true,
  });

  const [adjustLine] = useMutation<AdjustOrderLineMutation>(ADJUST_QUANTITY, {
    refetchQueries: [{ query: GET_ACTIVE_ORDER }],
    awaitRefetchQueries: true,
  });

  const [removeLine] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: GET_ACTIVE_ORDER }],
    awaitRefetchQueries: true,
  });

  const getCount = useMemo(() => {
    return () =>
      data?.activeOrder?.lines?.reduce(
        (sum, l) => sum + (l?.quantity ?? 0),
        0
      ) ?? 0;
  }, [data]);

  const getOrderLineIdByVariantId = (variantId: string) =>
    data?.activeOrder?.lines?.find(
      (line) => line?.productVariant?.id === variantId
    )?.id;

  const addToCartMutation = async (variables: AddItemToOrderMutationVariables) => {
    const result = await addItem({ variables });
    return result.data?.addItemToOrder;
  };

  const handleAdjustQuantity = async (orderLineId: string, quantity: number) => {
    await adjustLine({ variables: { orderLineId, quantity } });
  };

  const removeFromCartMutation = async (orderLineId: string) => {
    await removeLine({ variables: { orderLineId } });
  };

  useSyncCartOnLogin(!!customer, addToCartMutation, clearCart);

  return (
    <CartContext.Provider
      value={{
        cart: data,
        activeOrder: data?.activeOrder,
        getCount,
        loading: authLoading || cartLoading,
        addToCartMutation,
        handleAdjustQuantity,
        removeFromCartMutation,
        getOrderLineIdByVariantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;