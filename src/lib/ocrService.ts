import { createWorker } from 'tesseract.js';

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
  }

  async extractReceiptData(file: File) {
    try {
      if (!this.worker) {
        await this.initialize();
      }

      const result = await this.worker!.recognize(file);
      const text = result.data.text;

      // Basic parsing of the extracted text
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      
      // Try to extract information using common patterns
      const amount = this.extractAmount(text);
      const date = this.extractDate(text);
      const vendor = this.extractVendor(lines);

      return {
        vendor: vendor || "Unknown",
        amount: amount || 0,
        date: date?.toISOString() || new Date().toISOString(),
        items: [],
        confidence: result.data.confidence / 100,
      };
    } catch (error) {
      console.error("Error extracting receipt data:", error);
      throw error;
    }
  }

  private extractAmount(text: string): number | null {
    // Look for currency patterns
    const amountRegex = /\$?\d+\.\d{2}/g;
    const matches = text.match(amountRegex);
    
    if (matches) {
      // Get the largest amount as it's likely the total
      const amounts = matches.map(m => parseFloat(m.replace('$', '')));
      return Math.max(...amounts);
    }
    
    return null;
  }

  private extractDate(text: string): Date | null {
    // Common date formats
    const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;
    const matches = text.match(dateRegex);
    
    if (matches) {
      const date = new Date(matches[0]);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  }

  private extractVendor(lines: string[]): string | null {
    // Usually the vendor name is in the first few lines
    // and is often in all caps
    for (const line of lines.slice(0, 3)) {
      if (line.length > 3 && line === line.toUpperCase()) {
        return line;
      }
    }
    
    return lines[0] || null;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}