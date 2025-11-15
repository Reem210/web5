import React, { useRef } from 'react';
import { FileCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-orange-600 uppercase tracking-wide">
        {t('upload.bim')}
      </div>
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                   transition-all duration-200 min-h-[120px] flex flex-col items-center justify-center
                   ${disabled 
                     ? 'border-gray-300 bg-white cursor-not-allowed' 
                     : 'border-orange-400 hover:border-orange-500 hover:bg-orange-50 bg-white'
                   }`}
      >
        {file ? (
          <div className="flex flex-col items-center space-y-2">
            <FileCheck className="w-8 h-8 text-green-600" />
            <div className="text-sm font-medium text-gray-900">{file.name}</div>
            <div className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className={`font-bold text-lg ${disabled ? 'text-gray-400' : 'text-orange-600'}`}>
              {t('click.to.upload')}
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".ifc,.stp,.step"
          className="hidden"
          disabled={disabled}
        />
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Supported formats: IFC, STP, STEP
      </div>
    </div>
  );
};

export default FileUpload;