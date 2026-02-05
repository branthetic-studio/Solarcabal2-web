"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useUser } from "@/context/UserContext"; // adjust if needed
import { GET_CUSTOMER_ADDRESSES } from "@/graphql/queries";

type AddressForm = {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber: string;
};

type AddressModalProps = {
  trigger: React.ReactNode;
  onSubmit: (data: AddressForm) => void;

  /** Optional: prefill form (e.g. existing order shipping address) */
  initialValue?: Partial<AddressForm>;

  /** Optional controlled open */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type SavedAddress = {
  id: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  streetLine1?: string | null;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  defaultShippingAddress?: boolean | null;
  country?: { code: string } | null;
};

type GetCustomerAddressesData = {
  activeCustomer: {
    id: string;
    addresses: SavedAddress[];
  } | null;
};

const defaultForm: AddressForm = {
  fullName: "",
  phoneNumber: "",
  streetLine1: "",
  streetLine2: "",
  city: "",
  province: "",
  postalCode: "",
  countryCode: "NG",
};

const toForm = (a?: Partial<AddressForm>): AddressForm => ({
  ...defaultForm,
  ...a,
  streetLine2: a?.streetLine2 ?? "",
  province: a?.province ?? "",
  postalCode: a?.postalCode ?? "",
  countryCode: a?.countryCode ?? "NG",
});

const savedToForm = (a: SavedAddress): AddressForm => ({
  fullName: a.fullName ?? "",
  phoneNumber: a.phoneNumber ?? "",
  streetLine1: a.streetLine1 ?? "",
  streetLine2: a.streetLine2 ?? "",
  city: a.city ?? "",
  province: a.province ?? "",
  postalCode: a.postalCode ?? "",
  countryCode: a.country?.code ?? "NG",
});

export default function AddressModal({
  trigger,
  onSubmit,
  initialValue,
  open: controlledOpen,
  onOpenChange,
}: AddressModalProps) {
  const { customer } = useUser();

  const isControlled = typeof controlledOpen === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  // Fetch saved addresses only when modal is open + logged in
  const { data, loading } = useQuery<GetCustomerAddressesData>(
    GET_CUSTOMER_ADDRESSES,
    {
      skip: !open || !customer?.id,
      fetchPolicy: "network-only",
    }
  );

  const savedAddresses = data?.activeCustomer?.addresses ?? [];
  const defaultSaved =
    savedAddresses.find((a) => a.defaultShippingAddress) ?? null;

  const [selectedSavedId, setSelectedSavedId] = React.useState<string>("");

  const [form, setForm] = React.useState<AddressForm>(toForm(initialValue));

  // On open:
  // - If initialValue provided (editing order address), use that
  // - Else if default saved exists, prefill with default saved
  // - Else start blank
  React.useEffect(() => {
    if (!open) return;

    if (initialValue && Object.keys(initialValue).length > 0) {
      setSelectedSavedId("");
      setForm(toForm(initialValue));
      return;
    }

    if (defaultSaved) {
      setSelectedSavedId(defaultSaved.id);
      setForm(savedToForm(defaultSaved));
      return;
    }

    setSelectedSavedId("");
    setForm(toForm(undefined));
  }, [open, initialValue, defaultSaved?.id]);

  // When user picks a saved address
  React.useEffect(() => {
    if (!open) return;
    if (!selectedSavedId) return;

    const picked = savedAddresses.find((a) => a.id === selectedSavedId);
    if (picked) setForm(savedToForm(picked));
  }, [selectedSavedId, savedAddresses, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearToManual = () => {
    setSelectedSavedId("");
    // keep initialValue if it exists? user asked "opportunity to change whether there is one or not"
    // so "manual" means blank
    setForm(toForm(undefined));
  };

  const useDefaultSaved = () => {
    if (!defaultSaved) return;
    setSelectedSavedId(defaultSaved.id);
    setForm(savedToForm(defaultSaved));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      streetLine2: form.streetLine2 || "",
      province: form.province || "",
      postalCode: form.postalCode || "",
      countryCode: form.countryCode || "NG",
    });
    setOpen(false);
  };

  const title =
    initialValue && Object.keys(initialValue).length > 0
      ? "Edit Shipping Address"
      : "Shipping Address";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />

        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-neutral-800">
              {title}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                className="text-neutral-400 hover:text-neutral-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Saved address picker (only for logged-in customers) */}
          {customer?.id ? (
            <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-800">
                  Saved addresses
                </p>
                <button
                  type="button"
                  onClick={clearToManual}
                  className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                >
                  Enter manually
                </button>
              </div>

              {loading ? (
                <p className="mt-2 text-xs text-neutral-600">
                  Loading saved addresses…
                </p>
              ) : savedAddresses.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-600">
                  No saved addresses found. Fill the form below.
                </p>
              ) : (
                <>
                  {defaultSaved ? (
                    <button
                      type="button"
                      onClick={useDefaultSaved}
                      className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs hover:bg-neutral-100"
                    >
                      Use default saved address
                    </button>
                  ) : null}

                  <div className="mt-2">
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Choose a saved address
                    </label>
                    <select
                      value={selectedSavedId}
                      onChange={(e) => setSelectedSavedId(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="">— Select —</option>
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {(a.fullName ?? "Unnamed") +
                            " • " +
                            (a.city ?? "") +
                            " • " +
                            (a.streetLine1 ?? "")}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-[11px] text-neutral-600">
                      Select one to prefill, then edit below if needed.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. John Doe"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="e.g. +234 800 000 0000"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="streetLine1"
                placeholder="e.g. 123 Main Street"
                value={form.streetLine1}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Apartment, Suite, etc. (Optional)
              </label>
              <input
                type="text"
                name="streetLine2"
                placeholder="e.g. Apt 4B"
                value={form.streetLine2 ?? ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Lagos"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  name="province"
                  placeholder="e.g. Lagos"
                  value={form.province ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="e.g. 100001"
                  value={form.postalCode ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="countryCode"
                  value={form.countryCode ?? "NG"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                >
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="KE">Kenya</option>
                  <option value="ZA">South Africa</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-full bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              Save Address
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}