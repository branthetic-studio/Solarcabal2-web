"use client";

import React, { useState, useMemo } from "react";

type PaymentFrequency = "weekly" | "monthly";

type InstallmentPaymentProps = {
  totalAmount: number; // in kobo (e.g. activeOrder.totalWithTax)
  onConfirm: (plan: InstallmentPlan) => void;
  onBack: () => void;
};

export type InstallmentPlan = {
  depositAmount: number;
  frequency: PaymentFrequency;
  periods: number;
  repaymentAmount: number;
  insuranceFee: number;
};

const INSURANCE_RATE = 0.01; // 1%

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function InstallmentPayment({
  totalAmount,
  onConfirm,
  onBack,
}: InstallmentPaymentProps) {
  // totalAmount is in kobo → convert to naira for display/calc
  const totalNaira = totalAmount / 100;

  const minDeposit = Math.ceil(totalNaira * 0.3); // 30% min deposit
  const maxDeposit = Math.ceil(totalNaira * 1);   // up to full amount

  const [depositInput, setDepositInput] = useState<string>(
    String(minDeposit)
  );
  const [frequency, setFrequency] = useState<PaymentFrequency>("monthly");
  const [periods, setPeriods] = useState<number>(4);

  const deposit = useMemo(() => {
    const val = Number(depositInput.replace(/,/g, ""));
    if (isNaN(val)) return minDeposit;
    return Math.min(Math.max(val, minDeposit), maxDeposit);
  }, [depositInput, minDeposit, maxDeposit]);

  const balance = totalNaira - deposit;

  const repaymentAmount = useMemo(() => {
    if (balance <= 0 || periods <= 0) return 0;
    return Math.ceil(balance / periods);
  }, [balance, periods]);

  const insuranceFee = useMemo(
    () => Math.ceil(totalNaira * INSURANCE_RATE),
    [totalNaira]
  );

  const periodOptions =
    frequency === "weekly"
      ? [4, 8, 12, 16, 20, 24]
      : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setDepositInput(raw);
  };

  const handleDepositBlur = () => {
    const val = Number(depositInput);
    const clamped = Math.min(Math.max(isNaN(val) ? minDeposit : val, minDeposit), maxDeposit);
    setDepositInput(String(clamped));
  };

  const handleConfirm = () => {
    onConfirm({
      depositAmount: deposit,
      frequency,
      periods,
      repaymentAmount,
      insuranceFee,
    });
  };

  return (
    <div className="rounded-2xl border border-[#d1d1d1] bg-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-neutral-800">
            Installment Payment
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Total order value: {NGN.format(totalNaira)}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-red-500 hover:text-red-600 underline"
        >
          ← Back
        </button>
      </div>

      {/* Deposit Amount */}
      <div>
        <p className="text-sm font-semibold text-neutral-800 mb-2">
          Deposit Amount
        </p>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-neutral-500">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={depositInput}
              onChange={handleDepositChange}
              onBlur={handleDepositBlur}
              className="flex-1 bg-transparent text-sm font-semibold text-neutral-800 outline-none"
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-neutral-400">
          Deposit Payment should be between {NGN.format(minDeposit)} to{" "}
          {NGN.format(maxDeposit)}
        </p>
      </div>

      {/* Payment Frequency */}
      <div>
        <p className="text-sm font-semibold text-neutral-800 mb-3">
          Select Payment Frequency
        </p>
        <div className="flex gap-6">
          {(["weekly", "monthly"] as PaymentFrequency[]).map((f) => (
            <label
              key={f}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <span
                onClick={() => {
                  setFrequency(f);
                  // reset period to first option of new frequency
                  setPeriods(f === "weekly" ? 4 : 2);
                }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  frequency === f
                    ? "border-red-500"
                    : "border-neutral-300"
                }`}
              >
                {frequency === f && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                )}
              </span>
              <span className="text-sm text-neutral-700 capitalize">{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Period of Repayment */}
      <div>
        <p className="text-sm font-semibold text-neutral-800 mb-3">
          Select Period of Repayment
          <span className="ml-1 text-xs font-normal text-neutral-400">
            ({frequency === "weekly" ? "weeks" : "months"})
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriods(p)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                periods === p
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Repayment Amount */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs text-neutral-500 mb-1">
            {frequency === "weekly" ? "Weekly" : "Monthly"} Repayment Amount
          </p>
          <p className="text-sm font-semibold text-neutral-800">
            {NGN.format(repaymentAmount)}
          </p>
        </div>

        {/* Insurance Fee */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-neutral-500">Insurance Fee</p>
            <span className="text-xs font-semibold text-red-500">1%</span>
          </div>
          <p className="text-sm font-semibold text-neutral-800">
            {NGN.format(insuranceFee)}
          </p>
        </div>
      </div>

      {/* Balance remaining */}
      {balance > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex justify-between items-center">
          <p className="text-xs text-neutral-600">
            Remaining balance after deposit
          </p>
          <p className="text-sm font-semibold text-red-600">
            {NGN.format(balance)}
          </p>
        </div>
      )}

      {/* Confirm Button */}
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
      >
        Confirm Installment Plan
      </button>
    </div>
  );
}