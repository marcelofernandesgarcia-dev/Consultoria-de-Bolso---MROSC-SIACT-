import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        setError('Por favor, envie apenas arquivos PDF.');
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={twMerge(
          "border-2 border-dashed rounded-xl p-10 transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center",
          isDragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
          isProcessing && "opacity-50 cursor-not-allowed pointer-events-none",
          error && "border-red-300 bg-red-50/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : error ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {isProcessing ? 'Processando arquivo...' : 'Upload do Processo (PDF)'}
        </h3>
        
        <p className="text-slate-500 text-sm max-w-sm">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            "Arraste e solte seu arquivo PDF aqui, ou clique para selecionar. O sistema analisará automaticamente a admissibilidade e prescrição."
          )}
        </p>
      </div>
    </div>
  );
}
