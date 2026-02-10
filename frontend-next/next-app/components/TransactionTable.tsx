"use client";

import { Transaction } from "@/lib/api";

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = "px-2.5 py-1 rounded-full text-xs font-semibold";
    switch (status.toLowerCase()) {
      case "succeeded":
        return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case "pending":
        return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case "failed":
      case "canceled":
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  const truncateId = (id: string, length: number = 12) => {
    return `${id.substring(0, length)}...`;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No transactions found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Transaction ID
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Acc Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Customer
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Connected Account
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-4 px-4">
                <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {truncateId(transaction.id)}
                </code>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {transaction.accountName}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={getStatusBadgeClass(transaction.status)}>
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </span>
              </td>
              <td className="py-4 px-4">
                {transaction.customer ? (
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {truncateId(transaction.customer)}
                  </code>
                ) : (
                  <span className="text-gray-400 dark:text-gray-600">—</span>
                )}
              </td>
              <td className="py-4 px-4">
                {transaction.connectedAccount ? (
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {truncateId(transaction.connectedAccount)}
                  </code>
                ) : (
                  <span className="text-gray-400 dark:text-gray-600">—</span>
                )}
              </td>
              <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(transaction.stripeCreatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
