"use client";

import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_ACTIVE_ORDER,
  ADD_TO_CART,
  ADJUST_QUANTITY,
} from "@/graphql/queries";
import {
  GetActiveOrderData,
  AddItemToOrderMutation,
  AddItemToOrderMutationVariables,
  AdjustOrderLineMutation,
  AdjustOrderLineMutationVariables,
  ActiveOrder,
} from "@/graphql/types.manual";

// Types for what the context provides
type AddToCartFn = (options: {
  variables: AddItemToOrderMutationVariables;
}) => Promise<void>;

type UseCartContext = {
  cart: GetActiveOrderData | undefined;
  activeOrder: ActiveOrder | null | undefined;
  getCount: () => number;
  addToCartMutation: AddToCartFn;
  handleAdjustQuantity: (lineId: string, quantity: number) => Promise<void>;
};

// Initial (empty) context
const initialCtx: UseCartContext = {
  cart: undefined,
  activeOrder: undefined,
  getCount: () => 0,
  addToCartMutation: async () => {},
  handleAdjustQuantity: async () => {},
};

const CartContext = createContext<UseCartContext>(initialCtx);

export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }: PropsWithChildren) => {
  const { data, refetch } = useQuery<GetActiveOrderData>(GET_ACTIVE_ORDER, {
    fetchPolicy: "cache-and-network",
  });

  const [addItem] = useMutation<
    AddItemToOrderMutation,
    AddItemToOrderMutationVariables
  >(ADD_TO_CART, {
    refetchQueries: [{ query: GET_ACTIVE_ORDER }],
    awaitRefetchQueries: true,
  });

  const [adjustLine] = useMutation<
    AdjustOrderLineMutation,
    AdjustOrderLineMutationVariables
  >(ADJUST_QUANTITY, {
    refetchQueries: [{ query: GET_ACTIVE_ORDER }],
    awaitRefetchQueries: true,
  });

  const getCount = useMemo(() => {
    return () =>
      data?.activeOrder?.totalQuantity ??
      data?.activeOrder?.lines?.reduce(
        (sum, l) => sum + (l?.quantity ?? 0),
        0
      ) ??
      0;
  }, [data]);

  const addToCartMutation: AddToCartFn = async ({ variables }) => {
    await addItem({ variables });
  };

  const handleAdjustQuantity = async (lineId: string, quantity: number) => {
    await adjustLine({ variables: { orderLineId: lineId, quantity } });
  };

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <CartContext.Provider
      value={{
        cart: data,
        activeOrder: data?.activeOrder,
        getCount,
        addToCartMutation,
        handleAdjustQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
