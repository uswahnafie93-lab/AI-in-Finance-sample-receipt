import { GoogleGenAI, Type } from "@google/genai";
import { ApiResponse } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function extractFinancialData(
  files: { data: string; mimeType: string }[]
): Promise<ApiResponse> {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    You are a professional financial auditor and data extraction expert.
    Extract structured financial data from the provided documents (receipts, invoices, images).
    
    RULES:
    1. Always prioritize the most prominent company name.
    2. Extract the FINAL total amount (numeric only).
    3. Normalize dates to YYYY-MM-DD.
    4. Categorize accurately: Food & Beverage, Transportation, Accommodation, Utilities, Office Supplies, Entertainment, Medical, Groceries, Shopping, Others.
    5. If unclear, default to "Others".
    6. Ignore tax breakdown.
    7. Return null for missing fields.
    8. If multiple documents are provided, return one object per document.
  `;

  try {
    const parts = [
      ...files.map(f => ({
        inlineData: {
          mimeType: f.mimeType,
          data: f.data
        }
      })),
      { text: "Extract the data from these documents in order." }
    ];

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            data: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company_name: { type: Type.STRING },
                  date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                  total_amount: { type: Type.NUMBER },
                  category: { 
                    type: Type.STRING,
                    enum: [
                      'Food & Beverage',
                      'Transportation',
                      'Accommodation',
                      'Utilities',
                      'Office Supplies',
                      'Entertainment',
                      'Medical',
                      'Groceries',
                      'Shopping',
                      'Others'
                    ]
                  }
                },
                required: ["company_name", "date", "total_amount", "category"]
              }
            }
          },
          required: ["data"]
        }
      }
    });

    const text = response.text || '{"data": []}';
    return JSON.parse(text) as ApiResponse;
  } catch (error) {
    console.error("Extraction error:", error);
    throw new Error("Failed to process the documents. Please try again.");
  }
}

export function generateCSV(results: ApiResponse['data']): string {
  const headers = "company_name,date,total_amount,category";
  const rows = results.map(r => {
    const name = (r.company_name || '').replace(/,/g, '');
    const date = r.date || '';
    const amount = r.total_amount || 0;
    const cat = r.category || 'Others';
    return `${name},${date},${amount},${cat}`;
  });
  return [headers, ...rows].join("\n");
}
