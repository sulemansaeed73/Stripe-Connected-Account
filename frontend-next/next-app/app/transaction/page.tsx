"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/lib/api";
import PaymentForm from "@/components/PaymentForm";
import { fetchConnectedAccounts } from "@/lib/api";
import { ConnectedAccount } from "@/lib/api";

export default function TransactionPage() {
  const router = useRouter();
  const [step, setStep] = useState<"customer" | "payment">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchConnectedAccounts();
        setConnectedAccounts(data);
      } catch (error) {
        console.error("Error fetching connected accounts:", error);
      }
    };
    fetchData();
  }, []);

  // Customer form state
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Payment form state
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [connectedAccountId, setConnectedAccountId] = useState("");
  const [amount, setAmount] = useState(""); // Fixed at $50 as requested
  const [currency] = useState("usd");

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const customer = await createCustomer(
        customerEmail,
        customerName || undefined
      );
      setCustomerId(customer.id);
      setSuccess(`Customer created successfully! ID: ${customer.id}`);
      setTimeout(() => {
        setStep("payment");
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string, status: string) => { 
    setSuccess(
      `Payment created successfully! Payment Intent ID: ${paymentIntentId}. Status: ${status}`
    );
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Create Transaction
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a customer and transfer payment to connected account
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === "customer"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-green-600 border-green-600 text-white"
                }`}
              >
                {step === "customer" ? (
                  <span className="text-sm font-semibold">1</span>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Customer
              </div>
            </div>

            <div className="w-24 h-0.5 mx-4 bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center">
              
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === "payment"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : customerId
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-gray-200 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                {step === "payment" ? (
                  <span className="text-sm font-semibold">2</span>
                ) : customerId ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Payment
              </div>
            </div>

          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-800 dark:text-green-300 font-medium">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Customer Creation Form */}
        {step === "customer" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Step 1: Create Customer
            </h2>
            <form onSubmit={handleCreateCustomer} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="John Doe"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Customer...
                  </>
                ) : (
                  "Create Customer"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Payment Creation Form */}
        {step === "payment" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Step 2: Create Payment & Transfer
            </h2>
            {customerId && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-semibold">Customer ID:</span>{" "}
                  {customerId}
                </p>
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                  </div>
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={() => {
                      if (amount && !amount.includes(".")) {
                        setAmount(`${amount}.00`);
                      }
                    }}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Fixed amount: $50.00 USD
                </p>
              </div>

              <div>
                <label
                  htmlFor="connectedAccount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Connected Account <span className="text-red-500">*</span>
                </label>
                <select
                  id="connectedAccount"
                  required
                  value={connectedAccountId}
                  onChange={(e) => setConnectedAccountId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                >
                  <option value="">Select a connected account</option>
                  {connectedAccounts.map((acc) => (
                    <option key={acc.accountId} value={acc.accountId}>
                      {acc.accountId} — {acc.accountName || "No email"}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  The Stripe connected account where the payment will be
                  transferred
                </p>
              </div>

              {/* Stripe Elements Card Input */}
              {customerId && connectedAccountId && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Card Details (Test Mode)
                  </h3>
                  <PaymentForm
                    amount={Number(amount)}
                    currency={currency}
                    customerId={customerId}
                    connectedAccountId={connectedAccountId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </div>
              )}

              {(!customerId || !connectedAccountId) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-semibold mb-1">Note:</p>
                      <p>
                        Please fill in the Connected Account ID above to proceed
                        with payment. Card details will be collected securely
                        using Stripe Elements.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Secure Payment:</p>
                    <p className="mb-2">
                      This will create a payment intent for $50.00 USD and
                      transfer it to the connected account. Use Stripe test card
                      numbers (e.g., 4242 4242 4242 4242). The payment will be
                      automatically confirmed.
                    </p>
                    <p className="text-xs italic">
                      Card details are securely collected and tokenized using
                      Stripe Elements. No card data touches our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
