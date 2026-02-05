"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";

type AddressModalProps = {
  trigger: React.ReactNode;
  onSubmit: (data: {
    fullName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    countryCode?: string;
    phoneNumber: string;
  }) => void;
};

export default function AddressModal({ trigger, onSubmit }: AddressModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    streetLine1: "",
    streetLine2: "",
    city: "",
    province: "",
    postalCode: "",
    countryCode: "NG",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />

        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-neutral-800">
              Shipping Address
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
                value={form.streetLine2}
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
                  value={form.province}
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
                  value={form.postalCode}
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
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm({ ...form, countryCode: e.target.value })
                  }
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