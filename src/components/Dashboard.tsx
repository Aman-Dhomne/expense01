import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { Receipt } from '../types';

interface Props {
  receipts: Receipt[];
}

export function Dashboard({ receipts }: Props) {
  const categoryData = receipts.reduce((acc, receipt) => {
    const existing = acc.find(item => item.category === receipt.category);
    if (existing) {
      existing.amount += receipt.amount;
    } else {
      acc.push({ category: receipt.category, amount: receipt.amount });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
  const flaggedAmount = receipts
    .filter(r => r.flags.length > 0)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Total Expenses</h4>
          <p className="mt-2 text-3xl font-semibold">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Flagged Amount</h4>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            ${flaggedAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Total Receipts</h4>
          <p className="mt-2 text-3xl font-semibold">{receipts.length}</p>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}