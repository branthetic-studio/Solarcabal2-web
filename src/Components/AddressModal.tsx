"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";

type AddressModalProps = {
  trigger: React.ReactNode;
  onSubmit: (data: {
    fullName: string;
    email: string;
    homeAddress: string;
    deliveryAddress: string;
  }) => void;
};

export default function AddressModal({ trigger, onSubmit }: AddressModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    homeAddress: "",
    deliveryAddress: "",
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
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">Address details</h2>
            <Dialog.Close asChild>
              <button className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Enter Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="First name and Last name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Enter Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="First Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Enter Home Address
              </label>
              <input
                type="text"
                name="homeAddress"
                placeholder="First Home Address"
                value={form.homeAddress}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Enter Delivery Address
              </label>
              <input
                type="text"
                name="deliveryAddress"
                placeholder="First Delivery Address"
                value={form.deliveryAddress}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-full bg-red-600 py-3 text-white font-semibold hover:opacity-95"
            >
              Confirm and Continue
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
