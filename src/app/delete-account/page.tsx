"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { DELETE_MY_ACCOUNT } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

/* ---------- Manual types (no codegen) ---------- */
type DeleteMyAccountPayload =
  | { __typename: "Success"; success: boolean; message?: string | null }
  | {
      __typename: "ErrorResult";
      errorCode?: string | null;
      message?: string | null;
    };

type DeleteMyAccountResult = {
  deleteMyAccount: DeleteMyAccountPayload;
};

type DeleteMyAccountVars = Record<string, never>;
/* ----------------------------------------------- */

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");

  const [deleteAccount, { data, loading, error }] = useMutation<
    DeleteMyAccountResult,
    DeleteMyAccountVars
  >(DELETE_MY_ACCOUNT);

  const payload = data?.deleteMyAccount;
  const isSuccess = payload?.__typename === "Success";
  const successMsg =
    isSuccess && ("message" in payload ? payload.message : null)
      ? (payload as Extract<DeleteMyAccountPayload, { __typename: "Success" }>)
          .message
      : isSuccess
      ? "Your account has been deleted."
      : null;

  const errMsg =
    error?.message ||
    (payload?.__typename === "ErrorResult"
      ? payload.message || "Deletion failed."
      : null);

  const isConfirmed = confirm.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    await deleteAccount();
    if (!error) {
      // Clear local auth state/cookies if you keep any here
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Delete Account
          </h1>
          <p className="mt-3 text-sm text-neutral-700">
            This action is{" "}
            <span className="font-semibold text-red-600">permanent</span> and
            cannot be undone. All your data, orders, and saved information will
            be removed.
          </p>

          <div className="mt-5">
            <label className="text-sm text-neutral-700">
              To confirm, type <span className="font-bold">DELETE</span>:
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:outline-none"
              placeholder="DELETE"
            />
          </div>

          {errMsg && <p className="mt-3 text-sm text-red-600">❌ {errMsg}</p>}
          {successMsg && (
            <p className="mt-3 text-sm text-green-700">✅ {successMsg}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              disabled={!isConfirmed || loading}
              onClick={handleDelete}
            >
              {loading ? "Deleting…" : "Delete my account"}
            </button>
            <button
              className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-50"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}