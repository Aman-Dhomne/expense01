import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { Receipt } from '../types';

interface Props {
  receipts: Receipt[];
}

export function ExpenseList({ receipts }: Props) {
  return (
    <div className="divide-y divide-gray-200">
      {receipts.map((receipt) => (
        <div key={receipt.id} className="py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900">{receipt.vendor}</p>
              {receipt.flags.length > 0 && (
                <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="mt-1 flex text-sm text-gray-500 space-x-4">
              <p>${receipt.amount.toFixed(2)}</p>
              <p>{new Date(receipt.date).toLocaleDateString()}</p>
              <p>{receipt.category}</p>
            </div>
          </div>
          <div className="ml-4">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                receipt.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : receipt.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {receipt.status === 'approved' && <Check className="h-4 w-4 mr-1" />}
              {receipt.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}