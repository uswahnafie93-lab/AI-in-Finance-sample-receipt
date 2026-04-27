import { FileText, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { FileState } from '../types';

interface FileItemProps {
  fileState: FileState;
}

export function FileItem({ fileState }: FileItemProps) {
  const isImage = fileState.file.type.startsWith('image/');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100 flex-shrink-0">
        {isImage ? (
          <img src={fileState.previewUrl} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <FileText className="w-5 h-5 text-slate-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 truncate">
          {fileState.file.name}
        </p>
        <p className="text-[10px] text-slate-400 font-medium">
          {(fileState.file.size / 1024).toFixed(1)} KB
        </p>
      </div>

      <div className="flex items-center gap-2">
        {fileState.status === 'processing' && (
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
        )}
        {fileState.status === 'completed' && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        )}
        {fileState.status === 'error' && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
    </motion.div>
  );
}
