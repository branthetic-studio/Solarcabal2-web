"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import {
  GET_ACCOUNT_DETAILS,
  UPDATE_CUSTOMER,
  CREATE_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_ADDRESS,
  DELETE_CUSTOMER_ADDRESS,
} from "@/graphql/queries";

/* ------------------- Local TS types (Option 1) ------------------- */
type Country = { code: string; name: string };

type CustomerAddress = {
  id: string;
  fullName?: string | null;
  company?: string | null;
  streetLine1?: string | null;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
  defaultBillingAddress?: boolean | null;
  country?: Country | null;
};

type ActiveCustomer = {
  id: string;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailAddress: string;
  addresses: CustomerAddress[];
};

type GetAccountDetailsData = {
  activeCustomer: ActiveCustomer | null;
};

type UpdateCustomerData = {
  updateCustomer: {
    id: string;
    title?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    emailAddress: string;
  };
};

type UpdateCustomerVars = {
  input: {
    title?: string;
    firstName?: string;
    lastName?: string;
  };
};

type CreateCustomerAddressData = {
  createCustomerAddress: CustomerAddress;
};

type CreateCustomerAddressVars = {
  input: {
    fullName: string;
    company?: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    countryCode: string;
    phoneNumber: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
  };
};

type UpdateCustomerAddressData = {
  updateCustomerAddress: CustomerAddress;
};

type UpdateCustomerAddressVars = {
  input: {
    id: string;
    fullName?: string;
    company?: string;
    streetLine1?: string;
    streetLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phoneNumber?: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
  };
};

type DeleteCustomerAddressData = {
  deleteCustomerAddress: { success: boolean; message?: string | null };
};

type DeleteCustomerAddressVars = { id: string };

type AddressForm = {
  id?: string;
  fullName: string;
  company?: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  countryCode: string;
  phoneNumber: string;
  defaultShippingAddress: boolean;
  defaultBillingAddress: boolean;
};

const emptyAddress = (): AddressForm => ({
  fullName: "",
  company: "",
  streetLine1: "",
  streetLine2: "",
  city: "",
  province: "",
  postalCode: "",
  countryCode: "NG",
  phoneNumber: "",
  defaultShippingAddress: false,
  defaultBillingAddress: false,
});

export default function AccountPage() {
  const { customer, loading: userLoading, logout } = useUser();
  const router = useRouter();
  const {
    data,
    loading: accountLoading,
    refetch,
  } = useQuery<GetAccountDetailsData>(GET_ACCOUNT_DETAILS, {
    skip: !customer?.id,
    fetchPolicy: "network-only",
  });

  const activeCustomer = data?.activeCustomer ?? null;
  const addresses = activeCustomer?.addresses ?? [];

  const [profile, setProfile] = React.useState({
    title: "",
    firstName: "",
    lastName: "",
  });

  React.useEffect(() => {
    if (!activeCustomer) return;
    setProfile({
      title: activeCustomer.title ?? "",
      firstName: activeCustomer.firstName ?? "",
      lastName: activeCustomer.lastName ?? "",
    });
  }, [activeCustomer?.id]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [addr, setAddr] = React.useState<AddressForm>(emptyAddress());

  const [updateCustomer] = useMutation<UpdateCustomerData, UpdateCustomerVars>(
    UPDATE_CUSTOMER
  );

  const [createAddress] = useMutation<
    CreateCustomerAddressData,
    CreateCustomerAddressVars
  >(CREATE_CUSTOMER_ADDRESS);

  const [updateAddress] = useMutation<
    UpdateCustomerAddressData,
    UpdateCustomerAddressVars
  >(UPDATE_CUSTOMER_ADDRESS);

  const [deleteAddress] = useMutation<
    DeleteCustomerAddressData,
    DeleteCustomerAddressVars
  >(DELETE_CUSTOMER_ADDRESS);

  const openNewAddress = () => {
    setAddr(emptyAddress());
    setIsModalOpen(true);
  };

  const openEditAddress = (a: CustomerAddress) => {
    setAddr({
      id: a.id,
      fullName: a.fullName ?? "",
      company: a.company ?? "",
      streetLine1: a.streetLine1 ?? "",
      streetLine2: a.streetLine2 ?? "",
      city: a.city ?? "",
      province: a.province ?? "",
      postalCode: a.postalCode ?? "",
      countryCode: a.country?.code ?? "NG",
      phoneNumber: a.phoneNumber ?? "",
      defaultShippingAddress: !!a.defaultShippingAddress,
      defaultBillingAddress: !!a.defaultBillingAddress,
    });
    setIsModalOpen(true);
  };

  const saveProfile = async () => {
    try {
      await updateCustomer({
        variables: {
          input: {
            title: profile.title,
            firstName: profile.firstName,
            lastName: profile.lastName,
          },
        },
      });
      toast.success("Profile updated");
      await refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile");
    }
  };

  const saveAddress = async () => {
    try {
      if (!addr.fullName || !addr.streetLine1 || !addr.city) {
        toast.error("Full name, street, and city are required.");
        return;
      }

      if (addr.id) {
        await updateAddress({
          variables: {
            input: {
              id: addr.id,
              fullName: addr.fullName,
              company: addr.company,
              streetLine1: addr.streetLine1,
              streetLine2: addr.streetLine2,
              city: addr.city,
              province: addr.province,
              postalCode: addr.postalCode,
              phoneNumber: addr.phoneNumber,
              defaultShippingAddress: addr.defaultShippingAddress,
              defaultBillingAddress: addr.defaultBillingAddress,
            },
          },
        });
      } else {
        await createAddress({
          variables: {
            input: {
              fullName: addr.fullName,
              company: addr.company,
              streetLine1: addr.streetLine1,
              streetLine2: addr.streetLine2,
              city: addr.city,
              province: addr.province,
              postalCode: addr.postalCode,
              countryCode: addr.countryCode,
              phoneNumber: addr.phoneNumber,
              defaultShippingAddress: addr.defaultShippingAddress,
              defaultBillingAddress: addr.defaultBillingAddress,
            },
          },
        });
      }

      toast.success("Address saved");
      setIsModalOpen(false);
      await refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save address");
    }
  };

  const setDefault = async (
    addressId: string,
    kind: "shipping" | "billing"
  ) => {
    try {
      // Ensure exactly one default is true by updating all addresses
      await Promise.all(
        addresses.map((a) =>
          updateAddress({
            variables: {
              input: {
                id: a.id,
                defaultShippingAddress:
                  kind === "shipping"
                    ? a.id === addressId
                    : !!a.defaultShippingAddress,
                defaultBillingAddress:
                  kind === "billing"
                    ? a.id === addressId
                    : !!a.defaultBillingAddress,
              },
            },
          })
        )
      );

      toast.success(`Default ${kind} updated`);
      await refetch();
    } catch (e) {
      console.error(e);
      toast.error(`Failed to update default ${kind}`);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const res = await deleteAddress({ variables: { id } });
      const payload = res.data?.deleteCustomerAddress;

      if (payload?.success) {
        toast.success("Address deleted");
        await refetch();
      } else {
        toast.error(payload?.message ?? "Failed to delete address");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete address");
    }
  };

  if (userLoading) return <div className="p-6">Loading…</div>;

  if (!customer?.id) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Please log in to view your profile and saved addresses.
        </p>
      </div>
    );
  }

  if (accountLoading) return <div className="p-6">Loading account…</div>;

  if (!activeCustomer) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Could not load account details. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <div className="mb-4">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2"
        >
          <span aria-hidden>←</span>
          Back to home
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Account</h1>
        <button className="text-sm underline" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold">Customer details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="border rounded-lg p-2"
            placeholder="Title"
            value={profile.title}
            onChange={(e) =>
              setProfile((p) => ({ ...p, title: e.target.value }))
            }
          />
          <input
            className="border rounded-lg p-2"
            placeholder="First name"
            value={profile.firstName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, firstName: e.target.value }))
            }
          />
          <input
            className="border rounded-lg p-2"
            placeholder="Last name"
            value={profile.lastName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, lastName: e.target.value }))
            }
          />
          <input
            className="border rounded-lg p-2 bg-neutral-100"
            value={activeCustomer.emailAddress}
            disabled
          />
        </div>

        <button
          onClick={saveProfile}
          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm"
        >
          Save profile
        </button>
      </section>

      {/* Addresses */}
      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Saved addresses</h2>
          <button
            onClick={openNewAddress}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            Add address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-sm text-neutral-600">No saved addresses yet.</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-xl bg-neutral-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm">
                      {a.fullName ?? "Unnamed"}
                      {!!a.defaultShippingAddress ? (
                        <span className="ml-2 text-xs text-green-700">
                          (Default shipping)
                        </span>
                      ) : null}
                      {!!a.defaultBillingAddress ? (
                        <span className="ml-2 text-xs text-blue-700">
                          (Default billing)
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xs text-neutral-700 mt-1">
                      {a.streetLine1 ?? ""}
                      {a.streetLine2 ? `, ${a.streetLine2}` : ""},{" "}
                      {a.city ?? ""}
                      {a.province ? `, ${a.province}` : ""}{" "}
                      {a.country?.code ? `(${a.country.code})` : ""}
                    </div>

                    {a.phoneNumber ? (
                      <div className="text-xs text-neutral-600 mt-1">
                        {a.phoneNumber}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 text-xs">
                    <button
                      className="underline"
                      onClick={() => openEditAddress(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="underline"
                      onClick={() => setDefault(a.id, "shipping")}
                    >
                      Set default shipping
                    </button>
                    <button
                      className="underline"
                      onClick={() => setDefault(a.id, "billing")}
                    >
                      Set default billing
                    </button>
                    <button
                      className="underline text-red-600"
                      onClick={() => removeAddress(a.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Address Modal (simple inline modal) */}
      {isModalOpen ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {addr.id ? "Edit address" : "Add address"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="border rounded-lg p-2"
                placeholder="Full name"
                value={addr.fullName}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, fullName: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Phone"
                value={addr.phoneNumber}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, phoneNumber: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2 sm:col-span-2"
                placeholder="Company (optional)"
                value={addr.company}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, company: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2 sm:col-span-2"
                placeholder="Street line 1"
                value={addr.streetLine1}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, streetLine1: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2 sm:col-span-2"
                placeholder="Street line 2"
                value={addr.streetLine2}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, streetLine2: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="City"
                value={addr.city}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, city: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Province"
                value={addr.province}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, province: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Postal code"
                value={addr.postalCode}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, postalCode: e.target.value }))
                }
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Country code (NG)"
                value={addr.countryCode}
                onChange={(e) =>
                  setAddr((a) => ({ ...a, countryCode: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addr.defaultShippingAddress}
                  onChange={(e) =>
                    setAddr((a) => ({
                      ...a,
                      defaultShippingAddress: e.target.checked,
                    }))
                  }
                />
                Default shipping
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addr.defaultBillingAddress}
                  onChange={(e) =>
                    setAddr((a) => ({
                      ...a,
                      defaultBillingAddress: e.target.checked,
                    }))
                  }
                />
                Default billing
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
                onClick={saveAddress}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}