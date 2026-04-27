import { Copy, Download, Tag, Calendar, Building2, Banknote } from 'lucide-react';
import { ExtractionResult } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface ResultTableProps {
  results: ExtractionResult[];
  onExportCSV: () => void;
  onCopyJSON: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Beverage': 'bg-amber-50 text-amber-700 border-amber-100',
  'Transportation': 'bg-blue-50 text-blue-700 border-blue-100',
  'Office Supplies': 'bg-slate-100 text-slate-700 border-slate-200',
  'Accommodation': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Groceries': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Utilities': 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

export function ResultTable({ results, onExportCSV, onCopyJSON }: ResultTableProps) {
  if (results.length === 0) return null;

  return (
    <motion.section 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
    >
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-900 tracking-tight">Extracted Data Preview</h2>
        <div className="flex gap-2">
          <button 
            onClick={onCopyJSON}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Copy JSON
          </button>
          <button 
            onClick={onExportCSV}
            className="px-2 py-1 bg-indigo-600 rounded text-[10px] font-bold text-white uppercase hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-widest">
              <th className="px-6 py-4">Company Name</th>
              <th className="px-6 py-4">Transaction Date</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600">
            {results.map((result, idx) => (
              <tr 
                key={idx}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4 font-semibold text-slate-900">{result.company_name || 'N/A'}</td>
                <td className="px-6 py-4 font-mono text-xs">{result.date || '---- -- --'}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(result.total_amount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border tracking-tight ${CATEGORY_COLORS[result.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {result.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
