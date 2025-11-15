import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  message: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-12 py-8 rounded-xl shadow-2xl">
        <div className="flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <div className="text-xl font-semibold">{message}</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;