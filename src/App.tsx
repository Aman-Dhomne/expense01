import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { ReceiptUploader } from './components/ReceiptUploader';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import type { Receipt } from './types';

function App() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    loadReceipts();
  }, []);

  async function loadReceipts() {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error loading receipts:', error);
      return;
    }

    setReceipts(data);
  }

  const handleUploadComplete = (receipt: Receipt) => {
    setReceipts(prev => [receipt, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold">AI Expense Manager</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Upload Receipt</h2>
            <ReceiptUploader onUploadComplete={handleUploadComplete} />
          </div>

          {/* Dashboard */}
          <Dashboard receipts={receipts} />

          {/* Recent Expenses */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Recent Expenses</h2>
            <ExpenseList receipts={receipts} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;