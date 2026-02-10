'use client';

import { ConnectedAccount } from '@/lib/api';

interface Props {
  accounts: ConnectedAccount[];
}

export default function ConnectedAccountsTable({ accounts }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No connected accounts found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold">Account ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Country</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Charges</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Payouts</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>

        <tbody>
          {accounts.map(acc => (
            <tr
              key={acc.accountId}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-4 py-3 font-mono text-xs">{acc.accountId }</td>
              <td className="px-4 py-3 font-mono text-xs">{acc.accountName}</td>
              <td className="px-4 py-3 capitalize">{acc.type}</td>
              <td className="px-4 py-3">{acc.country}</td>
              <td className="px-4 py-3">
                {acc.email ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3">
                {acc.chargesEnabled ? '✅' : '❌'}
              </td>
              <td className="px-4 py-3">
                {acc.payoutsEnabled ? '✅' : '❌'}
              </td>
              <td className="px-4 py-3">
                {acc.detailsSubmitted ? '✅' : '❌'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
