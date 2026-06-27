"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
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
import Footer from "@/Components/Footer/Footer";
import Suscribe from "@/Components/Suscribe/Suscribe";
import Navbar from "@/Components/Navbar/Navbar";
import { ChevronDown, Loader2, Check, Trash2, Plus } from "lucide-react";
import { PhoneNumber } from "@clerk/nextjs/server";

// ─── Payout GQL ──────────────────────────────────────────────────────────────

const GET_BANK_LIST = gql`
  query GetBankList {
    paystackBanks {
      name
      code
      logo
    }
  }
`;

const MY_PAYOUT_ACCOUNTS = gql`
  query MyPayoutAccounts {
    myPayoutAccounts {
      id
      bankName
      accountNumber
      accountName
      bankCode
    }
  }
`;

const VERIFY_BANK_ACCOUNT = gql`
  mutation verifyBankAccount($accountNumber: String!, $bankCode: String!) {
    verifyBankAccount(accountNumber: $accountNumber, bankCode: $bankCode) {
      accountName
      accountNumber
      success
      message
    }
  }
`;

const ADD_PAYOUT_ACCOUNT = gql`
  mutation AddPayoutAccount($input: CreatePayoutAccountInput!) {
    addPayoutAccount(input: $input) {
      id
    }
  }
`;

const DELETE_PAYOUT_ACCOUNT = gql`
  mutation DeletePayoutAccount($id: String!) {
    deletePayoutAccount(id: $id)
  }
`;

// ─── Payout types ─────────────────────────────────────────────────────────────

type Bank = { name: string; code: string; logo?: string | null };

type PayoutAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
};

// ─── Payout Accounts Section ─────────────────────────────────────────────────

const PayoutAccountsSection = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [bankDropdownOpen, setBankDropdownOpen] = React.useState(false);
  const [bankSearch, setBankSearch] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [verifiedAccountName, setVerifiedAccountName] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const {
    data: accountsData,
    loading: accountsLoading,
    refetch: refetchAccounts,
  } = useQuery<{ myPayoutAccounts: PayoutAccount[] }>(MY_PAYOUT_ACCOUNTS, {
    fetchPolicy: "network-only",
  });

  const { data: banksData, loading: banksLoading } =
    useQuery<{ paystackBanks: Bank[] }>(GET_BANK_LIST);

  const [verifyBankAccount] = useMutation<{
    verifyBankAccount: {
      accountName: string;
      accountNumber: string;
      success: boolean;
      message: string;
    };
  }>(VERIFY_BANK_ACCOUNT);

  const [addPayoutAccount] = useMutation<{
    addPayoutAccount: { id: string };
  }>(ADD_PAYOUT_ACCOUNT);

  const [deletePayoutAccount] = useMutation<{
    deletePayoutAccount: boolean;
  }>(DELETE_PAYOUT_ACCOUNT);

  const savedAccounts = accountsData?.myPayoutAccounts ?? [];
  const banks = banksData?.paystackBanks ?? [];

  const filteredBanks = React.useMemo(
    () => banks.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase())),
    [banks, bankSearch]
  );

  const resetForm = () => {
    setSelectedBank(null);
    setAccountNumber("");
    setVerifiedAccountName(null);
    setBankSearch("");
    setShowForm(false);
  };

  const runVerify = async (accNum: string, bank: Bank) => {
    setVerifiedAccountName(null);
    if (accNum.length !== 10) return;
    try {
      setVerifying(true);
      const { data } = await verifyBankAccount({
        variables: { accountNumber: accNum, bankCode: bank.code },
      });
      const result = data?.verifyBankAccount;
      if (result?.success) {
        setVerifiedAccountName(result.accountName);
      } else {
        toast.error(result?.message ?? "Account verification failed.");
      }
    } catch {
      toast.error("Could not verify account. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleAccountNumberChange = async (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(digits);
    setVerifiedAccountName(null);
    if (digits.length === 10 && selectedBank) await runVerify(digits, selectedBank);
  };

  const handleBankSelect = async (bank: Bank) => {
    setSelectedBank(bank);
    setBankDropdownOpen(false);
    setBankSearch("");
    if (accountNumber.length === 10) await runVerify(accountNumber, bank);
  };

  const handleSave = async () => {
    if (!selectedBank || !accountNumber || !verifiedAccountName) return;
    try {
      setSaving(true);
      await addPayoutAccount({
        variables: {
          input: {
            bankName: selectedBank.name,
            bankCode: selectedBank.code,
            accountNumber,
            accountName: verifiedAccountName,
          },
        },
      });
      toast.success("Payout account saved!");
      await refetchAccounts();
      resetForm();
    } catch {
      toast.error("Failed to save account. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deletePayoutAccount({ variables: { id } });
      toast.success("Account removed.");
      await refetchAccounts();
    } catch {
      toast.error("Failed to remove account.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className=" bg-white p-5 space-y-4">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Payout accounts</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add account
          </button>
        )}
      </div> */}

      {/* Saved accounts list */}
      {/* {accountsLoading ? (
        <p className="text-sm text-neutral-400 animate-pulse">Loading accounts…</p>
      ) : savedAccounts.length === 0 && !showForm ? (
        <p className="text-sm text-neutral-500">No payout accounts saved yet.</p>
      ) : (
        <div className="space-y-2">
          {savedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between rounded-xl bg-neutral-100 px-3 py-2.5"
            >
              <div className="text-sm">
                <p className="font-medium">{acc.accountName}</p>
                <p className="text-neutral-500 text-xs">
                  {acc.bankName} · {acc.accountNumber}
                </p>
              </div>
              <button
                onClick={() => handleDelete(acc.id)}
                disabled={deletingId === acc.id}
                className="text-red-500 hover:text-red-700 disabled:opacity-40 ml-3"
                title="Remove account"
              >
                {deletingId === acc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )} */}

      {/* Add account form */}
      {/* {showForm && (
        <div className="border rounded-xl p-4 space-y-3 bg-neutral-50">
          <p className="text-sm font-medium">New payout account</p>

          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Bank</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setBankDropdownOpen((v) => !v)}
                className="w-full border rounded-lg p-2 text-sm flex items-center justify-between text-left bg-white"
              >
                <span className={selectedBank ? "text-black" : "text-neutral-400"}>
                  {selectedBank ? selectedBank.name : "Select a bank"}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {bankDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-hidden flex flex-col">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search bank…"
                      className="w-full text-sm p-1.5 border rounded"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto">
                    {banksLoading ? (
                      <p className="text-sm text-neutral-400 p-3 animate-pulse">Loading banks…</p>
                    ) : filteredBanks.length === 0 ? (
                      <p className="text-sm text-neutral-400 p-3">No banks found.</p>
                    ) : (
                      filteredBanks.map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => handleBankSelect(bank)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
                        >
                          {bank.logo && (
                            <img
                              src={bank.logo}
                              alt={bank.name}
                              className="w-5 h-5 rounded-full object-contain"
                            />
                          )}
                          {bank.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

     
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Account Number</label>
            <input
              type="text"
              placeholder="10-digit account number"
              maxLength={10}
              className="w-full border rounded-lg p-2 text-sm bg-white"
              value={accountNumber}
              onKeyDown={(e) => {
                const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
              }}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
            />
          </div>


          <div className="min-h-[28px]">
            {verifying && (
              <p className="text-sm text-neutral-400 flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying account…
              </p>
            )}
            {!verifying && verifiedAccountName && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Check className="w-4 h-4" />
                {verifiedAccountName}
              </div>
            )}
          </div>

 
          <div className="flex justify-end gap-3 pt-1">
            <button
              className="px-4 py-2 rounded-lg border text-sm"
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              onClick={handleSave}
              disabled={saving || !verifiedAccountName}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save account"}
            </button>
          </div>
        </div>
      )}
       */}
    </section>
  );
};

// ─── Local TS types ───────────────────────────────────────────────────────────

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

type GetAccountDetailsData = { activeCustomer: ActiveCustomer | null };

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
  input: { title?: string; firstName?: string; lastName?: string };
};

type CreateCustomerAddressData = { createCustomerAddress: CustomerAddress };

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

type UpdateCustomerAddressData = { updateCustomerAddress: CustomerAddress };

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

// ─── Main Page ────────────────────────────────────────────────────────────────

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
      phoneNumber: '',
  });

  console.log(activeCustomer?.addresses[0]?.phoneNumber, 'plol active customer')
  React.useEffect(() => {
    if (!activeCustomer) return;
    setProfile({
      title: activeCustomer.title ?? "",
      firstName: activeCustomer.firstName ?? "",
      lastName: activeCustomer.lastName ?? "",
      phoneNumber: activeCustomer?.addresses[0]?.phoneNumber ?? ""
    });
  }, [activeCustomer?.id]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [addr, setAddr] = React.useState<AddressForm>(emptyAddress());

  const [updateCustomer] = useMutation<UpdateCustomerData, UpdateCustomerVars>(UPDATE_CUSTOMER);
  const [createAddress] = useMutation<CreateCustomerAddressData, CreateCustomerAddressVars>(CREATE_CUSTOMER_ADDRESS);
  const [updateAddress] = useMutation<UpdateCustomerAddressData, UpdateCustomerAddressVars>(UPDATE_CUSTOMER_ADDRESS);
  const [deleteAddress] = useMutation<DeleteCustomerAddressData, DeleteCustomerAddressVars>(DELETE_CUSTOMER_ADDRESS);

  const openNewAddress = () => { setAddr(emptyAddress()); setIsModalOpen(true); };

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
        variables: { input: { title: profile.title, firstName: profile.firstName, lastName: profile.lastName } },
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

  const setDefault = async (addressId: string, kind: "shipping" | "billing") => {
    try {
      await Promise.all(
        addresses.map((a) =>
          updateAddress({
            variables: {
              input: {
                id: a.id,
                defaultShippingAddress: kind === "shipping" ? a.id === addressId : !!a.defaultShippingAddress,
                defaultBillingAddress: kind === "billing" ? a.id === addressId : !!a.defaultBillingAddress,
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

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (/\D/.test(pasted)) {
      e.preventDefault();
      const clean = pasted.replace(/\D/g, "");
      setAddr((prev) => ({ ...prev, phoneNumber: (prev.phoneNumber + clean).slice(0, 15) }));
    }
  };

  const handleAddrBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "fullName" && value.trim() && value.trim().split(/\s+/).filter(Boolean).length < 2) {
      toast.error("Full name must contain at least 2 words.");
    }
    if (name === "phoneNumber" && value && !/^\d{11,}$/.test(value)) {
      toast.error("Phone number must contain only numbers and be at least 11 digits.");
    }
  };

  if (userLoading)
    return (
      <div>
        <Navbar />
        <div className="min-h-50 flex items-center justify-center">Loading user details…</div>
        <Suscribe />
        <Footer />
      </div>
    );

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

  if (accountLoading)
    return (
      <div className="flex flex-col items-center justify-center">
        <Navbar />
        <div className="p-6 min-h-50">Loading account details…</div>
        <Suscribe />
        <Footer />
      </div>
    );

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
    <div className="mx-auto">
      <Navbar />
      <div className="max-w-5xl mx-auto py-20 pb-40 space-y-8 px-4">
        <div className="mb-4 max-w-5xl">
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
              onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
            />
            <input
              className="border rounded-lg p-2"
              placeholder="First name"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
            />
            <input
              className="border rounded-lg p-2"
              placeholder="Last name"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
            />
            <input
              className="border rounded-lg p-2 bg-neutral-100"
              value={activeCustomer.emailAddress}
              disabled
            />
             <input
              className="border rounded-lg p-2 bg-neutral-100"
              value={profile?.phoneNumber}
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

        {/* Payout accounts */}
        <PayoutAccountsSection />

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
                        {!!a.defaultShippingAddress && (
                          <span className="ml-2 text-xs text-green-700">(Default shipping)</span>
                        )}
                        {!!a.defaultBillingAddress && (
                          <span className="ml-2 text-xs text-blue-700">(Default billing)</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-700 mt-1">
                        {a.streetLine1 ?? ""}
                        {a.streetLine2 ? `, ${a.streetLine2}` : ""},{" "}
                        {a.city ?? ""}
                        {a.province ? `, ${a.province}` : ""}{" "}
                        {a.country?.code ? `(${a.country.code})` : ""}
                      </div>
                      {a.phoneNumber && (
                        <div className="text-xs text-neutral-600 mt-1">{a.phoneNumber}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 text-xs">
                      <button className="underline" onClick={() => openEditAddress(a)}>Edit</button>
                      <button className="underline" onClick={() => setDefault(a.id, "shipping")}>Set default shipping</button>
                      <button className="underline" onClick={() => setDefault(a.id, "billing")}>Set default billing</button>
                      <button className="underline text-red-600" onClick={() => removeAddress(a.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{addr.id ? "Edit address" : "Add address"}</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="border rounded-lg p-2"
                placeholder="Full name"
                name="fullName"
                value={addr.fullName}
                onBlur={handleAddrBlur}
                onChange={(e) => setAddr((a) => ({ ...a, fullName: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Phone"
                name="phoneNumber"
                value={addr.phoneNumber}
                onKeyDown={handlePhoneKeyDown}
                onPaste={handlePhonePaste}
                onBlur={handleAddrBlur}
                onChange={(e) => setAddr((a) => ({ ...a, phoneNumber: e.target.value.replace(/\D/g, "") }))}
              />
              <input
                className="border rounded-lg p-2 sm:col-span-2"
                placeholder="Company (optional)"
                value={addr.company}
                onChange={(e) => setAddr((a) => ({ ...a, company: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2 sm:col-span-2"
                placeholder="Street line 1"
                value={addr.streetLine1}
                onChange={(e) => setAddr((a) => ({ ...a, streetLine1: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2 sm:col-span-2"
                placeholder="Street line 2"
                value={addr.streetLine2}
                onChange={(e) => setAddr((a) => ({ ...a, streetLine2: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="City"
                value={addr.city}
                onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Province"
                value={addr.province}
                onChange={(e) => setAddr((a) => ({ ...a, province: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Postal code"
                value={addr.postalCode}
                onChange={(e) => setAddr((a) => ({ ...a, postalCode: e.target.value }))}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Country code (NG)"
                value={addr.countryCode}
                onChange={(e) => setAddr((a) => ({ ...a, countryCode: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addr.defaultShippingAddress}
                  onChange={(e) => setAddr((a) => ({ ...a, defaultShippingAddress: e.target.checked }))}
                />
                Default shipping
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addr.defaultBillingAddress}
                  onChange={(e) => setAddr((a) => ({ ...a, defaultBillingAddress: e.target.checked }))}
                />
                Default billing
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-500 text-white" onClick={saveAddress}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <Suscribe />
      <Footer />
    </div>
  );
}