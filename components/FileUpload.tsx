
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect, disabled]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50/50'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".ics,text/calendar"
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center">
        <div className={`mb-4 text-5xl ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`}>
          <UploadIcon />
        </div>
        <p className="mb-2 font-semibold text-slate-700">Drag & drop your .ics file here</p>
        <p className="text-slate-500 mb-4">or</p>
        <button
          onClick={handleButtonClick}
          disabled={disabled}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          Select File
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
