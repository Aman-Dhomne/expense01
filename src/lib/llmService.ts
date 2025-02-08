import OpenAI from "openai";

export class LLMService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async structureData(rawText: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps structure expense receipt data and validate compliance with company policies."
          },
          {
            role: "user",
            content: `Please structure the following receipt data and identify any potential policy violations: ${rawText}`
          }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error processing with LLM:", error);
      throw error;
    }
  }

  async generateJustification(expense: any, policy: any) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a detailed justification for an expense based on company policy."
          },
          {
            role: "user",
            content: `Generate a justification for this expense: ${JSON.stringify(expense)} 
                     Based on this policy: ${JSON.stringify(policy)}`
          }
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error generating justification:", error);
      throw error;
    }
  }
}