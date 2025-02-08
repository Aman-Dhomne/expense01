export interface Receipt {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  flags: string[];
  confidence: number;
  userId: string;
  createdAt: string;
}

export interface ExpenseReport {
  id: string;
  title: string;
  description: string;
  receipts: Receipt[];
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  flags: string[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: 'amount' | 'category' | 'frequency' | 'custom';
  condition: string;
  action: 'flag' | 'reject';
  severity: 'low' | 'medium' | 'high';
}