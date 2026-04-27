import React, { useState, useCallback } from 'react';
import { FileUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f: any) => 
      f.type.startsWith('image/') || f.type === 'application/pdf'
    ) as File[];
    if (files.length > 0) onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all duration-200 bg-white min-h-[220px] flex items-center justify-center shadow-sm",
        isDragging ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      
      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 transition-colors">
          <FileUp className={cn("w-8 h-8", isDragging ? "text-indigo-600" : "text-slate-400")} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upload Receipts & Invoices</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">
          Drag & drop PDF, JPG, or PNG files here
        </p>
        <button className="mt-4 text-indigo-600 font-bold text-xs border border-indigo-100 px-4 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors uppercase tracking-wider cursor-pointer">
          Browse Files
        </button>
      </div>
    </motion.div>
  );
}
