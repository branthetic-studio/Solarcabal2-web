"use client";

import {
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
// ✅ These three were missing
import { useUser } from "@/context/UserContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useSyncCartOnLogin } from "@/hooks/useSyncCartOnLogin";

type UseCartContext = {
  cart: GetActiveOrderData | undefined;
  activeOrder: ActiveOrder | null | undefined;
  getCount: () => number;
  loading: boolean;
  addToCartMutation: (
    variables: AddItemToOrderMutationVariables
  ) => Promise<any>;
  handleAdjustQuantity: (
    orderLineId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCartMutation: (orderLineId: string) => Promise<void>;
  getOrderLineIdByVariantId: (variantId: string) => string | undefined;
};

const initialCtx: UseCartContext = {
  cart: undefined,
  activeOrder: undefined,
  getCount: () => 0,
  loading: false,
  addToCartMutation: async () => { },
  handleAdjustQuantity: async () => { },
  removeFromCartMutation: async () => { },
  getOrderLineIdByVariantId: () => undefined,
};

const CartContext = createContext<UseCartContext>(initialCtx);
export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }: PropsWithChildren) => {
  // ✅ Pull in customer and clearCart for sync
  const { customer } = useUser();
  const { clearCart } = useLocalCart();

  const { data, refetch, loading } = useQuery<GetActiveOrderData>(
    GET_ACTIVE_ORDER,
    { fetchPolicy: "cache-and-network" }
  );


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

  const addToCartMutation = async (
    variables: AddItemToOrderMutationVariables
  ) => {
    const result = await addItem({ variables });
    return result.data?.addItemToOrder;
  };

  const handleAdjustQuantity = async (
    orderLineId: string,
    quantity: number
  ) => {
    await adjustLine({ variables: { orderLineId, quantity } });
  };

  const removeFromCartMutation = async (orderLineId: string) => {
    await removeLine({ variables: { orderLineId } });
  };

  useEffect(() => {
    void refetch();
  }, [refetch]);

  // ✅ This is what was missing — triggers the sync on login
  useSyncCartOnLogin(!!customer, addToCartMutation, clearCart);

  return (
    <CartContext.Provider
      value={{
        cart: data,
        activeOrder: data?.activeOrder,
        getCount,
        loading,
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