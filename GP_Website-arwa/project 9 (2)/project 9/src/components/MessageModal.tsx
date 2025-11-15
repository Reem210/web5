import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface MessageModalProps {
  type: 'success' | 'error';
  title: string;
  message?: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ type, title, message, onClose }) => {
  const isSuccess = type === 'success';
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white px-12 py-8 rounded-xl shadow-2xl max-w-md w-full mx-4 relative
                      ${isSuccess ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start space-x-4">
          {isSuccess ? (
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          )}
          
          <div className="flex-1">
            <div className={`text-xl font-bold mb-2 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {title}
            </div>
            {message && (
              <div className="text-gray-600 leading-relaxed">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;