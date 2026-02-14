"use client";
import React, { useMemo, useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Image from "next/image";
import PaymentScreens from "@/Components/payment/PaymentScreens";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gql } from "@apollo/client";
import Suscribe from "@/Components/Suscribe/Suscribe";
import AddressModal from "@/Components/AddressModal";
import { StaticImageData } from "next/image";





import {
  GET_ACTIVE_ORDER,
  GET_SHIPPING_METHODS,
  SET_SHIPPING_METHOD,
  SET_SHIPPING_ADDRESS,
  GET_CUSTOMER_ORDERS,
  TRANSITION_TO_STATE,
  PAYSTACK_INTENT,
  RECREATE_FAILED_ORDER,
} from "@/graphql/queries";

/* ------------------- Types ------------------- */
type PaymentMethod = "bank" | "card" | "Installment Payment";

type ActiveOrderLine = {
  id: string;
  quantity: number;
  linePriceWithTax: number;
  productVariant?: {
    name?: string;
    product?: {
      featuredAsset?: { preview?: string | null } | null;
    } | null;
  } | null;
};

type ActiveOrder = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  subTotalWithTax?: number | null;
  lines: ActiveOrderLine[];
  customer?: { emailAddress?: string | null } | null;
  shippingAddress?: any;
  shippingLines?: any[];
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type SetShippingAddressResponse = {
  setOrderShippingAddress:
  | ActiveOrder
  | {
    errorCode: string;
    message: string;
  };
};

type TransitionToStateResponse = {
  transitionOrderToState:
  | ActiveOrder
  | {
    __typename: "OrderStateTransitionError";
    errorCode: string;
    message: string;
    transitionError: string;
    fromState: string;
    toState: string;
  };
};

interface InfoRowProps {
  icon: string | StaticImageData; // <- allow image, emoji, or anything
  title: string;
  text: string;
}

/* ------------------- Formatter ------------------- */
const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/* ------------------- GraphQL Update Cart Mutation ------------------- */
const UPDATE_CART = gql`
  mutation UpdateCart($lineId: ID!, $quantity: Int!) {
    adjustOrderLineQuantity(orderLineId: $lineId, quantity: $quantity) {
      ... on Order {
        id
        totalQuantity
        lines {
          id
          quantity
          linePriceWithTax
          productVariant {
            name
            product {
              featuredAsset {
                preview
              }
            }
          }
        }
        totalWithTax
        subTotalWithTax
      }
      ... on OrderModificationError {
        message
      }
    }
  }
`;

const Page = () => {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<
    string | null
  >(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  // const [showSuccess, setShowSuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  /* ------------------- Active Order Query ------------------- */
  const { data: activeOrderData, refetch } = useQuery<{
    activeOrder: ActiveOrder;
  }>(GET_ACTIVE_ORDER);

  const activeOrder = activeOrderData?.activeOrder;

  /*----------------- shipping methods query ---------------- */
  const { data: shippingMethodsData } = useQuery<{
    eligibleShippingMethods: ShippingMethod[];
  }>(GET_SHIPPING_METHODS, {
    skip: !activeOrder, // Only fetch if there's an active order
  });

  const shippingMethods = shippingMethodsData?.eligibleShippingMethods || [];

  /* ------------------- Auto-select first shipping method ------------------- */
  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingMethod) {
      setSelectedShippingMethod(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingMethod]);

  /* ------------------- Mutations ------------------- */
  const [updateCartMutation] = useMutation(UPDATE_CART);
  const [setShippingAddressMutation] =
    useMutation<SetShippingAddressResponse>(SET_SHIPPING_ADDRESS);
  const [setShippingMethodMutation] = useMutation(SET_SHIPPING_METHOD);
  const [transitionToState] =
    useMutation<TransitionToStateResponse>(TRANSITION_TO_STATE);
  const [createPaystackIntent] = useMutation(PAYSTACK_INTENT);
  const [recreateFailedOrder] = useMutation(RECREATE_FAILED_ORDER);

  /* -------------- Update Quantity Handler -------------- */
  const updateQuantity = async (lineId: string, qty: number) => {
    if (qty < 1) return;

    try {
      const res = await updateCartMutation({
        variables: { lineId, quantity: qty },
      });

      // Type-safe narrowing for build mode
      const payload = res.data as {
        adjustOrderLineQuantity:
        | {
          __typename: "Order";
          id: string;
          totalQuantity: number;
          lines: ActiveOrderLine[];
          totalWithTax: number;
          subTotalWithTax?: number;
        }
        | {
          __typename: "OrderModificationError";
          message: string;
        };
      };

      if (payload.adjustOrderLineQuantity.__typename === "Order") {
        await refetch();
      } else {
        toast.error(payload.adjustOrderLineQuantity.message);
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      toast.error("Failed to update cart.");
    }
  };

  /* ------------------- Handle Address Submission ------------------- */
  const handleAddressSubmit = async (addressData: any) => {
    try {
      const result = await setShippingAddressMutation({
        variables: {
          input: {
            fullName: addressData.fullName,
            streetLine1: addressData.streetLine1,
            streetLine2: addressData.streetLine2 || "",
            city: addressData.city,
            province: addressData.province || "",
            postalCode: addressData.postalCode || "",
            countryCode: addressData.countryCode || "NG",
            phoneNumber: addressData.phoneNumber,
          },
        },
      });

      // ✅ Type-safe check
      const response = result.data?.setOrderShippingAddress;
      if (response && "id" in response) {
        setShippingAddress(addressData);
        toast.success("Shipping address saved");
        await refetch();
      } else if (response && "errorCode" in response) {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Error setting shipping address:", err);
      toast.error("Failed to set shipping address");
    }
  };

  /* ------------------- Checkout + Paystack ------------------- */
  const handleCheckout = async () => {
    if (!activeOrder) {
      toast.error("No active order found.");
      return;
    }

    // ✅ Validate shipping address
    if (!activeOrder.shippingAddress && !shippingAddress) {
      toast.error("Please add a shipping address");
      return;
    }

    // ✅ Validate shipping method
    if (!selectedShippingMethod) {
      toast.error("Please select a shipping method");
      return;
    }

    try {
      setIsPaying(true);

      // ✅ Step 1: Set shipping method if not already set
      if (
        !activeOrder.shippingLines ||
        activeOrder.shippingLines.length === 0
      ) {
        console.log("Setting shipping method...");
        await setShippingMethodMutation({
          variables: { id: [selectedShippingMethod] },
        });
      }

      // ✅ Step 2: Transition to ArrangingPayment
      console.log("Transitioning to ArrangingPayment...");
      const transitionResult = await transitionToState({
        variables: { state: "ArrangingPayment" },
      });

      const transitionResponse = transitionResult.data?.transitionOrderToState;
      if (
        transitionResponse &&
        "__typename" in transitionResponse &&
        transitionResponse.__typename === "OrderStateTransitionError"
      ) {
        toast.error(`Cannot proceed: ${transitionResponse.transitionError}`);
        setIsPaying(false);
        return;
      }

      // ✅ Step 3: Create Paystack payment intent
      console.log("Creating Paystack payment intent...");
      await createPaystackIntent({
        variables: { orderCode: activeOrder.code },
      });

      // Step 4: Initialize Paystack
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        amount: activeOrder.totalWithTax,
        email: activeOrder.customer?.emailAddress || "",
        reference: activeOrder.code,
        onSuccess: () => {
          router.replace(
            `/main/checkout/paystack-redirect?reference=${activeOrder.id}&status=success&amount=${activeOrder.totalWithTax}`
          );
        },
        onCancel: async () => {
          await recreateFailedOrder({
            variables: { orderCode: activeOrder.code },
          });
          toast.error("Payment cancelled");
          router.replace("/cart");
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-md font-semibold text-neutral-800">
          Payment Method
        </h1>
        <p className="text-xs text-neutral-500">
          Showing your selected products
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* ---------------- LEFT SIDE ---------------- */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#d1d1d1]  p-5">
              <p className="mb-4 text-lg font-semibold">Payment</p>

              {/* Radio Buttons */}
              <div className="flex flex-col gap-4">
                <RadioRow
                  checked={method === "bank"}
                  onChange={() => setMethod("bank")}
                  label="Bank Transfer"
                />

                <RadioRow
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                  label="Debit Cards"
                  right={
                    <div className="flex gap-2 items-center">
                      <Image
                        src="/master card.png"
                        alt="Visa"
                        width={36}
                        height={36}
                      />

                      <Image
                        src="/visapay.png"
                        alt="Visa"
                        width={36}
                        height={36}
                      />

                      <button
                        onClick={() => setShowPayment(true)}
                        className="w-6 h-6 flex items-center justify-center border rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  }
                />

                <RadioRow
                  checked={method === "Installment Payment"}
                  onChange={() => setMethod("Installment Payment")}
                  label={<span className="">Installment Payment</span>}
                />
              </div>

              {/* Billing address */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Billing Address</p>

                <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5">
                  <p className="mb-4 text-lg font-semibold">Shipping Address</p>

                  {activeOrder?.shippingAddress || shippingAddress ? (
                    <div className="bg-neutral-100 rounded-xl p-3">
                      <p className="text-sm font-medium">
                        {activeOrder?.shippingAddress?.fullName ||
                          shippingAddress?.fullName}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {activeOrder?.shippingAddress?.streetLine1 ||
                          shippingAddress?.streetLine1}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {activeOrder?.shippingAddress?.city ||
                          shippingAddress?.city}
                      </p>
                      <AddressModal
                        trigger={
                          <button className="mt-2 text-xs text-red-500 hover:text-red-600">
                            Change Address
                          </button>
                        }
                        onSubmit={handleAddressSubmit}
                      />
                    </div>
                  ) : (
                    <AddressModal
                      trigger={
                        <button className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">
                          Add Shipping Address
                        </button>
                      }
                      onSubmit={handleAddressSubmit}
                    />
                  )}
                </div>

                <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5">
                  <p className="mb-4 text-lg font-semibold">Shipping Method</p>

                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg cursor-pointer hover:bg-neutral-200"
                      >
                        <div className="flex gap-3 items-center">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShippingMethod === method.id}
                            onChange={() =>
                              setSelectedShippingMethod(method.id)
                            }
                            className="accent-red-500"
                          />
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-neutral-600">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {NGN.format(method.price / 100)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Back to cart */}
            <button
              onClick={() => router.push("/cart")}
              className="text-red-500 text-sm font-medium flex items-center gap-2"
            >
              <Image
                src="/shopping-cart.png"
                alt="Back"
                width={16}
                height={16}
              />{" "}
              Return to Cart
            </button>

            {/* Info rows */}
            <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5 pt-8">
              <h3 className="text-sm font-semibold mb-4 border-b border-[#d1d1d1] pb-4">
                Delivery & Products
              </h3>

              <div className="flex flex-col gap-5">
                <InfoRow
                  icon="/truck.png"
                  title="Delivery"
                  text="1–9 business days"
                />
                <InfoRow
                  icon="/repeat.png"
                  title="Returns"
                  text="7-day return policy"
                />
                <InfoRow
                  icon="/shield.png"
                  title="Warranty"
                  text="Varies per item"
                />
              </div>
            </div>
          </section>

          {/* ---------------- RIGHT SIDE (SUMMARY) ---------------- */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#d1d1d1] bg-white p-6">
              <p className="text-sm font-semibold mb-3">Your Order</p>

              <div className="space-y-5">
                {activeOrder?.lines?.map((ln) => (
                  <div key={ln.id} className="flex gap-3 items-start">
                    <Image
                      src={
                        ln.productVariant?.product?.featuredAsset?.preview ||
                        "/placeholder.png"
                      }
                      alt="preview"
                      width={55}
                      height={55}
                      className="rounded border bg-[#F3F5F7] p-4"
                    />

                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        {ln.productVariant?.name}
                      </p>
                      <p className="text-xs text-neutral-500">Category</p>

                      <div className="flex justify-between">
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className="w-4 h-4 border rounded-full text-xs"
                            onClick={() => updateQuantity(ln.id, ln.quantity - 1)}
                          >
                            –
                          </button>

                          <span className="text-xs">{ln.quantity}</span>

                          <button
                            className="w-4 h-4 border rounded-full text-xs"
                            onClick={() => updateQuantity(ln.id, ln.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {NGN.format(ln.linePriceWithTax / 100)}
                          </p>
                          <button className="text-xs text-red-500 flex items-center gap-1">Remove <Image src="/trash.png" alt="Remove" width={12} height={12} /></button>
                        </div>
                      </div>
                    </div>


                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <Row
                  label="Subtotal"
                  value={NGN.format((activeOrder?.subTotalWithTax ?? 0) / 100)}
                />
                <Row label="Discount" value="- ₦1,011.87" />
                <Row label="Shipping" value="₦252,000" />
              </div>

              <div className="mt-3">
                <Row
                  big
                  bold
                  label="Grand Total"
                  value={NGN.format((activeOrder?.totalWithTax ?? 0) / 100)}
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPaying}
                className={`mt-4 w-full py-3 rounded-full text-white text-sm font-medium ${isPaying ? "bg-red-300" : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {isPaying ? "Processing..." : "Checkout"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Suscribe />
      <Footer />

      {showPayment && <PaymentScreens onClose={() => setShowPayment(false)} />}
    </main>
  );
};

/* ---------------- Helper Components ---------------- */
function RadioRow({ checked, onChange, label, right }: any) {
  return (
    <label className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg cursor-pointer">
      <div className="flex gap-3 items-center">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="accent-red-500"
        />
        <span>{label}</span>
      </div>
      {right}
    </label>
  );
}

function Row({ label, value, bold, big }: any) {
  return (
    <div className="flex justify-between text-[#717171] font-xs">
      <span className="font-light">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${big ? "text-base" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BrandDot({ className }: any) {
  return <div className={`w-6 h-6 rounded-full ${className}`} />;
}

function InfoRow({ icon, title, text }: InfoRowProps) {
  type Props = {
    icon: string | StaticImageData;
  };
  return (
    <div className="flex items-center gap-3 border-b border-[#f0f0f0] pb-2">
      <Image className=" flex-shrink-0" src={icon} alt="Icon" width={24} height={24} />

      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}

export default Page;