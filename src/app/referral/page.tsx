"use client";

import { useRef } from "react"; 
import { useMemo, useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Suscribe/Suscribe";
import "./Referral.css";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import { Copy, Check, ChevronDown, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import AuthModal from "@/Components/AuthModal";
import { X } from "lucide-react";
import { toast } from "sonner";

const toNaira = (kobo: number) => (kobo / 100).toLocaleString();

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_MY_REFERRAL_CODE = gql`
  query GetMyReferralCode {
    activeCustomer {
      id
      customFields {
        referralCode
      }
    }
  }
`;

const MY_REFERRAL_SUMMARY = gql`
  query MyReferralSummary {
    myReferralSummary {
      totalEarned
      totalWithdrawn
      available
    }
  }
`;

const MY_REFERRAL_EARNING = gql`
  query MyReferralEarnings {
    myReferralEarnings {
      id
      amount
      level
      createdAt
      code
    }
  }
`;

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

// ─── Mutations ───────────────────────────────────────────────────────────────

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

const REQUEST_PAYOUT = gql`
  mutation RequestPayout($amount: Int!, $payoutAccountId: String!) {
    requestPayout(amount: $amount, payoutAccountId: $payoutAccountId)
  }
`;

const ADD_PAYOUT_ACCOUNT = gql`
  mutation AddPayoutAccount($input: CreatePayoutAccountInput!) {
    addPayoutAccount(input: $input) {
      id
    }
  }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type ReferralEarning = {
  id: string;
  amount: number;
  level: number;
  createdAt?: string | null;
  code?: string | null;
};

type PayoutAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
};

type Bank = {
  name: string;
  code: string;
  logo?: string | null;
};

// ─── Earnings Table ───────────────────────────────────────────────────────────

const EarningsTable = ({ rows, title }: { rows: ReferralEarning[]; title: string }) => (
  <>
    <h4 className="text-center font-semibold mt-8 mb-2 text-lg">{title}</h4>
    <table>
      <thead>
        <tr>
          <th>Referral ID</th>
          <th>Amount</th>
          <th>Order Code</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((ref) => (
          <tr key={ref.id}>
            <td className="table-id">{ref.id}</td>
            <td className="table-price">₦{toNaira(ref.amount)}</td>
            <td>{ref.code ?? "-"}</td>
            <td>{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

// ─── Withdraw Modal ───────────────────────────────────────────────────────────

type WithdrawModalProps = {
  available: number;
  onClose: () => void;
};

const WithdrawModal = ({ available, onClose }: WithdrawModalProps) => {
  const [step, setStep] = useState<"select" | "new">("select");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedAccountName, setVerifiedAccountName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: accountsData, loading: accountsLoading, refetch: refetchAccounts } =
    useQuery<{ myPayoutAccounts: PayoutAccount[] }>(MY_PAYOUT_ACCOUNTS, {
      fetchPolicy: "cache-and-network",
    });

  const { data: banksData, loading: banksLoading } =
    useQuery<{ paystackBanks: Bank[] }>(GET_BANK_LIST, {
      fetchPolicy: "cache-first", // banks list rarely changes
    });

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

  const [requestPayout] = useMutation<{
    requestPayout: boolean;
  }>(REQUEST_PAYOUT);

  const savedAccounts = accountsData?.myPayoutAccounts ?? [];
  const banks = banksData?.paystackBanks ?? [];
  const availableNaira = available / 100;

  const filteredBanks = useMemo(
    () => banks.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase())),
    [banks, bankSearch]
  );

  const runVerify = async (accNum: string, bank: Bank) => {
    try {
      setVerifying(true);
      setVerifiedAccountName(null);
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
    setVerifiedAccountName(null);
    if (accountNumber.length === 10) await runVerify(accountNumber, bank);
  };

  const handleSaveAccount = async () => {
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
      toast.success("Account saved!");
      await refetchAccounts();
      setStep("select");
      setSelectedBank(null);
      setAccountNumber("");
      setVerifiedAccountName(null);
    } catch {
      toast.error("Failed to save account. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPayout = async () => {
    const amountNaira = parseInt(amount, 10);
    if (!amountNaira || amountNaira <= 0) return toast.error("Enter a valid amount.");
    if (amountNaira > availableNaira) return toast.error("Amount exceeds your available balance.");
    if (!selectedAccountId) return toast.error("Please select a payout account.");
    try {
      setSubmitting(true);
      await requestPayout({
        variables: { amount: amountNaira * 100, payoutAccountId: selectedAccountId },
      });
      toast.success("Withdrawal request submitted!");
      onClose();
    } catch {
      toast.error("Withdrawal request failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {step === "new" ? "Add Payout Account" : "Withdraw Commission"}
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "select" && (
          <>
            <p className="text-sm text-neutral-500">
              Available balance:{" "}
              <span className="font-semibold text-black">₦{availableNaira.toLocaleString()}</span>
            </p>

            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Amount (₦)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full border rounded-lg p-2 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 mb-2 block">Payout Account</label>
              {accountsLoading ? (
                <p className="text-sm text-neutral-400 animate-pulse">Loading accounts...</p>
              ) : savedAccounts.length === 0 ? (
                <p className="text-sm text-neutral-400">No saved accounts yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedAccounts.map((acc) => (
                    <label
                      key={acc.id}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedAccountId === acc.id
                          ? "border-red-500 bg-red-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payoutAccount"
                        value={acc.id}
                        checked={selectedAccountId === acc.id}
                        onChange={() => setSelectedAccountId(acc.id)}
                        className="accent-red-500"
                      />
                      <div className="text-sm">
                        <p className="font-medium">{acc.accountName}</p>
                        <p className="text-neutral-500">{acc.bankName} · {acc.accountNumber}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep("new")}
                className="mt-3 text-sm text-red-500 hover:underline font-medium"
              >
                + Add new account
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 rounded-lg border text-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                onClick={handleSubmitPayout}
                disabled={submitting || !selectedAccountId || !amount}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : "Submit Request"}
              </button>
            </div>
          </>
        )}

        {step === "new" && (
          <>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Bank</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBankDropdownOpen((v) => !v)}
                  className="w-full border rounded-lg p-2 text-sm flex items-center justify-between text-left"
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
                        autoFocus
                        type="text"
                        placeholder="Search bank..."
                        className="w-full text-sm p-1.5 border rounded"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                      />
                    </div>
                    <div className="overflow-y-auto">
                      {banksLoading ? (
                        <p className="text-sm text-neutral-400 p-3 animate-pulse">Loading banks...</p>
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
                              <img src={bank.logo} alt={bank.name} className="w-5 h-5 rounded-full object-contain" />
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
                className="w-full border rounded-lg p-2 text-sm"
                value={accountNumber}
                onKeyDown={(e) => {
                  const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"];
                  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
                }}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
              />
            </div>

            <div className="min-h-7">
              {verifying && (
                <p className="text-sm text-neutral-400 flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying account...
                </p>
              )}
              {!verifying && verifiedAccountName && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <Check className="w-4 h-4" />
                  {verifiedAccountName}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 rounded-lg border text-sm" onClick={() => setStep("select")}>
                Back
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                onClick={handleSaveAccount}
                disabled={saving || !verifiedAccountName}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : "Save Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ReferralPage = () => {
  const { customer, loading: authLoading } = useUser();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // ✅ useLazyQuery for all auth-dependent queries
  const [fetchSummary, { data: summaryData, loading: summaryLoading }] =
    useLazyQuery<{
      myReferralSummary: {
        totalEarned: number;
        totalWithdrawn: number;
        available: number;
      };
    }>(MY_REFERRAL_SUMMARY, {
      fetchPolicy: "cache-and-network",
    });

  const [fetchEarnings, { data, loading }] =
    useLazyQuery<{ myReferralEarnings: ReferralEarning[] }>(
      MY_REFERRAL_EARNING,
      {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
      }
    );

  const [fetchReferralCode, { data: referralCodeData, loading: codeLoading }] =
    useLazyQuery(GET_MY_REFERRAL_CODE, {
      fetchPolicy: "network-only",
    });

  const prevCustomerId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const currentId = customer?.id ?? null;

    if (customer === undefined) return; // still loading auth

    if (currentId !== prevCustomerId.current) {
      prevCustomerId.current = currentId;

      if (currentId) {
        // ✅ Fire queries when user becomes available
        fetchSummary();
        fetchEarnings();
        fetchReferralCode();
      }
    }
  }, [customer, fetchSummary, fetchEarnings, fetchReferralCode]);

  const referralCode = (referralCodeData as any)?.activeCustomer?.customFields
    ?.referralCode as string | undefined;

  const referrals: ReferralEarning[] = (data?.myReferralEarnings ?? []).filter(
    Boolean
  ) as ReferralEarning[];

  const summary = summaryData?.myReferralSummary;
  const availableBalance = summary?.available ?? 0;

  const level1Referrals = useMemo(
    () => referrals.filter((r) => r.level === 1),
    [referrals]
  );

  const level2Referrals = useMemo(
    () => referrals.filter((r) => r.level === 2),
    [referrals]
  );

  const level1Earnings = useMemo(
    () => level1Referrals.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    [level1Referrals]
  );

  const level2Earnings = useMemo(
    () => level2Referrals.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    [level2Referrals]
  );

  const premiumData = useMemo(
    () => [
      {
        title: "Premium 1 Earning",
        price: `₦${toNaira(level1Earnings)}`,
        text: "Total referrals",
        num: level1Referrals.length.toString(),
      },
      {
        title: "Premium 2 Earning",
        price: `₦${toNaira(level2Earnings)}`,
        text: "Total referrals",
        num: level2Referrals.length.toString(),
      },
    ],
    [
      level1Earnings,
      level2Earnings,
      level1Referrals.length,
      level2Referrals.length,
    ]
  );

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Full-page loader while auth resolves
  if (customer === undefined) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />

      

      <div className="relative bg-[#181818] py-10 md:py-16 pt-20 md:pt-30 px-4 overflow-hidden">
        <div className="absolute bottom-0 left-0 opacity-100 z-10 pointer-events-none">
          <Image src="/footershadow2.png" alt="Background decoration" width={300} height={300} />
        </div>
        <div className="absolute top-0 right-0 opacity-100 z-100 pointer-events-none">
          <Image src="/footershadow1.png" alt="Background decoration" width={300} height={300} />
        </div>

        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
          <Image
            src="/bonus.gif"
            alt="Rewards"
            className="w-28 h-28 md:w-36 md:h-36 object-contain"
            width={60}
            height={60}
          />
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Refer a Friend & Earn Rewards
          </h4>
          <p className="text-xl text-[#ffffff] leading-relaxed max-w-4xl">
            Share your referral code and earn rewards when your friends order.
          </p>

          {customer ? (
            <div className="w-full max-w-md bg-[#2c2929] rounded-xl flex items-center justify-between px-5 py-4 mt-2 min-h-16">
              {codeLoading ? (
                <span className="text-white/70 text-sm animate-pulse">Loading your referral code...</span>
              ) : referralCode ? (
                <>
                  <span className="text-white text-base md:text-lg font-medium break-all">{referralCode}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors ml-4 shrink-0"
                  >
                    {copied ? (
                      <><Check className="w-5 h-5" /><span className="text-sm font-medium">Copied!</span></>
                    ) : (
                      <><Copy className="w-5 h-5" /><span className="text-sm font-medium">Copy</span></>
                    )}
                  </button>
                </>
              ) : (
                <span className="text-white/70 text-sm">No referral code available.</span>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md bg-[#2c2929] rounded-xl px-5 py-4 mt-2 text-white/90">
              <p className="text-sm">Log in to view and copy your referral code, and to see your earnings.</p>
              <div className="mt-4 flex justify-center">
                <AuthModal
                  trigger={
                    <button className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Log in / Sign up
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {customer && (
        <>
          <h3 className="text-center mt-8 py-3">
            Earnings Overview
            <button
              onClick={() => setWithdrawOpen(true)}
              disabled={availableBalance === 0 || summaryLoading}
              className="ml-4 px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Withdraw
            </button>
          </h3>

          {summary && (
            <div className="flex justify-center gap-6 flex-wrap text-sm text-center mb-2">
              <div>
                <p className="text-neutral-500">Total Earned</p>
                <p className="font-semibold text-lg">₦{toNaira(summary.totalEarned)}</p>
              </div>
              <div>
                <p className="text-neutral-500">Total Withdrawn</p>
                <p className="font-semibold text-lg">₦{toNaira(summary.totalWithdrawn)}</p>
              </div>
              <div>
                <p className="text-neutral-500">Available</p>
                <p className="font-semibold text-lg text-green-600">₦{toNaira(summary.available)}</p>
              </div>
            </div>
          )}

          <section className="premium-data relative bg-[#181818]">
            {premiumData.map((item, index) => (
              <div key={index} className={index === 1 ? "data" : "data1"}>
                <div>
                  <span className="title">{item.title}</span>
                  <p className="data-price">{item.price}</p>
                </div>
                <hr />
                <div className="flex flex-col justify-center align-middle">
                  <span className="text">{item.text}</span>
                  <p className="num">{item.num}</p>
                </div>
              </div>
            ))}
          </section>

          {loading && (
            <p style={{ textAlign: "center", marginTop: "20px" }} className="my-12 text-xl pt-6 font-semibold">
              Loading referral data...
            </p>
          )}

          {!loading && referrals.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "20px" }} className="my-12 text-xl pt-6 font-semibold">
              No referral earnings yet.
            </p>
          )}

          {!loading && referrals.length > 0 && (
            <>
              {level1Referrals.length > 0 && (
                <EarningsTable rows={level1Referrals} title="Premium 1 Earnings" />
              )}
              {level2Referrals.length > 0 && (
                <EarningsTable rows={level2Referrals} title="Premium 2 Earnings" />
              )}
            </>
          )}
        </>
      )}

      {withdrawOpen && (
        <WithdrawModal
          available={availableBalance}
          onClose={() => setWithdrawOpen(false)}
        />
      )}

      <Refer />
      <Footer />
    </main>
  );
};

export default ReferralPage;