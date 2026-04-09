"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useUser } from "@/context/UserContext";
import { GET_CUSTOMER_ADDRESSES } from "@/graphql/queries";
import * as NaijaStates from "naija-state-local-government";

type AddressForm = {
  fullName: string;
  streetLine1: string;
  streetLine2?: string; // used to store LGA
  city: string;
  province?: string; // stores selected State
  postalCode?: string;
  countryCode?: string;
  phoneNumber: string;
};

type AddressModalProps = {
  trigger: React.ReactNode;
  onSubmit: (data: AddressForm) => void;
  initialValue?: Partial<AddressForm>;
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

type FormErrors = {
  fullName?: string;
  phoneNumber?: string;
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

const ALL_STATES: string[] = NaijaStates.states();

const getLgas = (state: string): string[] => {
  if (!state) return [];
  try {
    return NaijaStates.lgas(state)?.lgas ?? [];
  } catch {
    return [];
  }
};

const normalizeFullName = (value: string) => value.replace(/\s+/g, " ").trim();

const isValidFullName = (value: string): boolean => {
  const normalized = normalizeFullName(value);
  const words = normalized.split(" ").filter(Boolean);
  return words.length >= 2;
};

const sanitizePhoneNumber = (value: string): string => value.replace(/\D/g, "");

const isValidPhoneNumber = (value: string): boolean => /^\d{11,}$/.test(value);

const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = ["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};


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
  const [errors, setErrors] = React.useState<FormErrors>({});

  const lgas = React.useMemo(() => getLgas(form.province ?? ""), [form.province]);

  React.useEffect(() => {
    if (!open) return;

    if (initialValue && Object.keys(initialValue).length > 0) {
      setSelectedSavedId("");
      setForm(toForm(initialValue));
      setErrors({});
      return;
    }

    if (defaultSaved) {
      setSelectedSavedId(defaultSaved.id);
      setForm(savedToForm(defaultSaved));
      setErrors({});
      return;
    }

    setSelectedSavedId("");
    setForm(toForm(undefined));
    setErrors({});
  }, [open, initialValue, defaultSaved?.id]);

  React.useEffect(() => {
    if (!open) return;
    if (!selectedSavedId) return;

    const picked = savedAddresses.find((a) => a.id === selectedSavedId);
    if (picked) {
      setForm(savedToForm(picked));
      setErrors({});
    }
  }, [selectedSavedId, savedAddresses, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated: AddressForm = { ...prev };

      if (name === "phoneNumber") {
        updated.phoneNumber = sanitizePhoneNumber(value);
      } else if (name === "fullName") {
        updated.fullName = value;
      } else if (name === "province") {
        updated.province = value;
        updated.streetLine2 = "";
      } else if (name === "streetLine2") {
        updated.streetLine2 = value;
      } else if (name === "streetLine1") {
        updated.streetLine1 = value;
      } else if (name === "city") {
        updated.city = value;
      } else if (name === "postalCode") {
        updated.postalCode = value;
      } else if (name === "countryCode") {
        updated.countryCode = value;
      }

      return updated;
    });

    if (name === "fullName" || name === "phoneNumber") {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const clearToManual = () => {
    setSelectedSavedId("");
    setForm(toForm(undefined));
    setErrors({});
  };

  const useDefaultSaved = () => {
    if (!defaultSaved) return;
    setSelectedSavedId(defaultSaved.id);
    setForm(savedToForm(defaultSaved));
    setErrors({});
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!isValidFullName(form.fullName)) {
      nextErrors.fullName = "Full name must contain at least 2 words.";
    }

    if (!isValidPhoneNumber(form.phoneNumber)) {
      nextErrors.phoneNumber =
        "Phone number must contain only numbers and be at least 11 digits.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      ...form,
      fullName: normalizeFullName(form.fullName),
      phoneNumber: sanitizePhoneNumber(form.phoneNumber),
      streetLine2: form.streetLine2 || "",
      province: form.province || "",
      postalCode: form.postalCode || "",
      countryCode: form.countryCode || "NG",
    });

    setOpen(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "fullName" && value.trim() && !isValidFullName(value)) {
      setErrors((prev) => ({ ...prev, fullName: "Full name must contain at least 2 words." }));
    }
    if (name === "phoneNumber" && value && !isValidPhoneNumber(value)) {
      setErrors((prev) => ({ ...prev, phoneNumber: "Phone number must contain only numbers and be at least 11 digits." }));
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (/\D/.test(pasted)) {
      e.preventDefault();
      // Strip non-digits and insert clean value
      const clean = pasted.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, phoneNumber: (prev.phoneNumber + clean).slice(0, 15) }));
    }
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

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${errors.fullName ? "border-red-500" : "border-neutral-300"
                  }`}
                required
              />
              {errors.fullName ? (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              ) : (
                <p className="mt-1 text-xs text-neutral-500">
                  Enter at least first name and last name.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="e.g. 08000000000"
                value={form.phoneNumber}
                onChange={handleChange}
                onKeyDown={handlePhoneKeyDown}
                onBlur={handleBlur}
                onPaste={handlePhonePaste}
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={11}
                maxLength={15}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${errors.phoneNumber ? "border-red-500" : "border-neutral-300"
                  }`}
                required
              />
              {errors.phoneNumber ? (
                <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
              ) : (
                <p className="mt-1 text-xs text-neutral-500">
                  Numbers only, minimum of 11 digits.
                </p>
              )}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Ikeja"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={form.province ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                >
                  <option value="">— Select State —</option>
                  {ALL_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  LGA <span className="text-red-500">*</span>
                </label>
                <select
                  name="streetLine2"
                  value={form.streetLine2 ?? ""}
                  onChange={handleChange}
                  disabled={!form.province}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
                  required
                >
                  <option value="">
                    {form.province ? "— Select LGA —" : "— Select State first —"}
                  </option>
                  {lgas.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
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