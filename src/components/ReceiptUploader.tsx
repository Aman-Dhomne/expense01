import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExpenseProcessor } from '../lib/expenseProcessor';

interface Props {
  onUploadComplete: (receipt: any) => void;
}

export function ReceiptUploader({ onUploadComplete }: Props) {
  const [isConfigured, setIsConfigured] = useState(() => {
    return Boolean(import.meta.env.VITE_OPENAI_KEY);
  });

  const processor = isConfigured
    ? new ExpenseProcessor(import.meta.env.VITE_OPENAI_KEY)
    : null;

  const onDrop = async (acceptedFiles: File[]) => {
    if (!isConfigured) {
      toast.error('OpenAI API key not configured. Please add it to .env');
      return;
    }

    const toastId = toast.loading('Processing receipt...');
    try {
      const receipt = await processor!.processReceipt(acceptedFiles[0]);
      onUploadComplete(receipt);
      toast.success('Receipt processed successfully!', { id: toastId });
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Failed to process receipt', { id: toastId });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      {!isConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <p className="text-sm">
            ⚠️ OpenAI API key not configured. Please add the following to your .env file:
          </p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>VITE_OPENAI_KEY</li>
          </ul>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop a receipt here, or click to select
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports JPG, PNG, and PDF files
        </p>
      </div>
    </div>
  );
}