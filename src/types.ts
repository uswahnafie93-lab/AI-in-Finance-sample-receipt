export type Category = 
  | 'Food & Beverage'
  | 'Transportation'
  | 'Accommodation'
  | 'Utilities'
  | 'Office Supplies'
  | 'Entertainment'
  | 'Medical'
  | 'Groceries'
  | 'Shopping'
  | 'Others';

export interface ExtractionResult {
  company_name: string | null;
  date: string | null; // YYYY-MM-DD
  total_amount: number | null;
  category: Category;
}

export interface FileState {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  result?: ExtractionResult;
}

export interface ApiResponse {
  data: ExtractionResult[];
}
