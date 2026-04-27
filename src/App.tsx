import { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { FileItem } from './components/FileItem';
import { ResultTable } from './components/ResultTable';
import { FileState, ExtractionResult } from './types';
import { extractFinancialData, generateCSV } from './services/gemini';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  Settings, 
  History, 
  LayoutDashboard, 
  Zap,
  Activity,
  Github
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const states: FileState[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
    }));
    setFiles(prev => [...prev, ...states]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  };

  const processFiles = async () => {
    const idleFiles = files.filter(f => f.status === 'idle');
    if (idleFiles.length === 0) return;

    setIsProcessing(true);
    setFiles(prev => prev.map(f => f.status === 'idle' ? { ...f, status: 'processing' } : f));

    try {
      const fileData = await Promise.all(idleFiles.map(async (fileState) => {
        return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ data: base64, mimeType: fileState.file.type });
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileState.file);
        });
      }));

      const response = await extractFinancialData(fileData);
      
      setFiles(prev => {
        let resultIdx = 0;
        return prev.map(f => {
          if (f.status === 'processing') {
            const result = response.data[resultIdx++];
            return {
              ...f,
              status: result ? 'completed' : 'error',
              result: result || undefined,
              error: result ? undefined : 'No data found'
            };
          }
          return f;
        });
      });
    } catch (error) {
      console.error(error);
      setFiles(prev => prev.map(f => f.status === 'processing' ? { ...f, status: 'error', error: 'Failed to process' } : f));
    } finally {
      setIsProcessing(false);
    }
  };

  const results = files
    .filter(f => f.status === 'completed' && f.result)
    .map(f => f.result as ExtractionResult);

  const exportCSV = () => {
    const csv = generateCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finextract-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify({ data: results }, null, 2));
  };

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">F</div>
          <span className="font-bold text-lg tracking-tight">FinExtract AI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full text-left sidebar-link sidebar-link-active cursor-pointer">
            <LayoutDashboard className="w-5 h-5" />
            Extraction Hub
          </button>
          <button className="w-full text-left sidebar-link sidebar-link-inactive cursor-pointer">
            <History className="w-5 h-5" />
            Batch History
          </button>
          <button className="w-full text-left sidebar-link sidebar-link-inactive cursor-pointer">
            <Settings className="w-5 h-5" />
            Rule Config
          </button>
        </nav>

        <div className="p-6 border-t border-slate-100 mt-auto">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-1 font-medium">Usage This Month</p>
            <p className="text-lg font-bold">8,432 / 10k</p>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-400 h-full w-[84%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligent Document Processor</h1>
            <p className="text-slate-500 text-sm">
              Extracting financial entities from current batch: 
              <span className="text-indigo-600 font-semibold ml-1">
                {files.length} document{files.length !== 1 ? 's' : ''} found
              </span>
            </p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={clearAll}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold bg-white hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
            <button 
              onClick={processFiles}
              disabled={isProcessing || !files.some(f => f.status === 'idle')}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-200"
            >
              <Sparkles className="w-4 h-4" /> 
              {isProcessing ? 'Processing' : 'Run Extraction'}
            </button>
          </div>
        </header>

        {/* Top Grid: Upload & Stats */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <FileUploader onFilesSelected={handleFilesSelected} />
          </div>
          
          {/* Quick Stats */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3" /> Accuracy
              </span>
              <span className="text-2xl font-bold text-emerald-600">99.4%</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> Processing
              </span>
              <span className="text-2xl font-bold text-slate-900">0.8s</span>
            </div>
            <div className="col-span-2 bg-indigo-900 p-5 rounded-2xl text-white flex flex-col justify-between overflow-hidden relative shadow-sm">
              <div className="z-10">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">System Status</span>
                <p className="text-lg font-medium leading-tight mt-1">Neural Engines Fully Operational</p>
              </div>
              <Sparkles className="absolute right-[-10px] bottom-[-10px] w-24 h-24 opacity-10" />
            </div>
          </div>
        </div>

        {/* Queue Preview */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {files.map(fileState => (
                <div key={fileState.id} className="relative group">
                  <FileItem fileState={fileState} />
                  {fileState.status === 'idle' && (
                    <button
                      onClick={() => removeFile(fileState.id)}
                      className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Area */}
        <ResultTable
          results={results}
          onExportCSV={exportCSV}
          onCopyJSON={copyJSON}
        />

        {/* Footer */}
        <footer className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 pt-8">
          <div className="flex items-center gap-4">
            <span>ENGINE: IDP-v4.2-PRO</span>
            <span className="flex items-center gap-1 text-indigo-500">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> 
              OCR ENHANCED MODE ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors uppercase">View Raw JSON</a>
            <a href="#" className="hover:text-slate-600 transition-colors uppercase flex items-center gap-1">
              <Github className="w-3 h-3" /> API Documentation
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
