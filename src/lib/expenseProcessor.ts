import { OCRService } from './ocrService';
import { LLMService } from './llmService';
import { FraudDetectionService } from './fraudDetection';
import { supabase } from './supabase';
import type { Receipt } from '../types';

export class ExpenseProcessor {
  private ocrService: OCRService;
  private llmService: LLMService;
  private fraudDetection: FraudDetectionService;

  constructor(openaiKey: string) {
    this.ocrService = new OCRService();
    this.llmService = new LLMService(openaiKey);
    this.fraudDetection = new FraudDetectionService();
  }

  async processReceipt(file: File): Promise<Receipt> {
    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(`receipts/${Date.now()}-${file.name}`, file);

    if (uploadError) throw uploadError;

    const imageUrl = supabase.storage
      .from('receipts')
      .getPublicUrl(uploadData.path).data.publicUrl;

    // Extract data using OCR
    const extractedData = await this.ocrService.extractReceiptData(file);

    // Structure and validate with LLM
    const structuredData = await this.llmService.structureData(
      JSON.stringify(extractedData)
    );

    // Check for fraud
    const isFraudulent = await this.fraudDetection.detectAnomalies([
      JSON.parse(structuredData)
    ]);

    const receipt: Receipt = {
      id: crypto.randomUUID(),
      ...JSON.parse(structuredData),
      imageUrl,
      status: 'pending',
      flags: isFraudulent[0] ? ['Potential fraud detected'] : [],
      confidence: extractedData.confidence,
      userId: (await supabase.auth.getUser()).data.user?.id || '',
      createdAt: new Date().toISOString()
    };

    // Save to database
    const { error: dbError } = await supabase
      .from('receipts')
      .insert(receipt);

    if (dbError) throw dbError;

    return receipt;
  }
}