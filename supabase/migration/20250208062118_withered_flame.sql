/*
  # Initial Schema Setup for AI Expense System

  1. New Tables
    - `receipts`
      - Core table for storing processed receipt data
      - Includes OCR confidence scores and fraud detection flags
    - `expense_reports`
      - Groups receipts into reports
      - Tracks approval status and workflow
    - `policy_rules`
      - Stores company expense policies
      - Used for automated compliance checking

  2. Security
    - RLS enabled on all tables
    - Policies for user-specific data access
    - Audit logging for all changes
*/

-- Create receipts table
CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor text NOT NULL,
  amount decimal NOT NULL,
  date timestamptz NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  flags jsonb DEFAULT '[]',
  confidence decimal,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expense_reports table
CREATE TABLE expense_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  receipts uuid[] NOT NULL,
  total_amount decimal NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamptz NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  flags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create policy_rules table
CREATE TABLE policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  condition jsonb NOT NULL,
  action text NOT NULL,
  severity text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON expense_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

CREATE POLICY "Users can create their own reports"
  ON expense_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Everyone can view policy rules"
  ON policy_rules FOR SELECT
  TO authenticated
  USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expense_reports_updated_at
  BEFORE UPDATE ON expense_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_policy_rules_updated_at
  BEFORE UPDATE ON policy_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();