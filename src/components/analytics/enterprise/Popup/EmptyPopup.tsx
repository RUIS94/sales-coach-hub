import React from 'react';
import { X } from 'lucide-react';

interface EmptyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  value: number;
}

const EmptyPopup: React.FC<EmptyPopupProps> = ({ isOpen, onClose, title, content, value }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">Analytics Detail</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Item</h4>
            <p className="text-gray-700">{content}</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Value</h4>
            <div className="flex items-center">
              <div 
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#605BFF' }}
              >
                {value}
              </div>
              <div className="ml-3 text-sm text-gray-600">
                Performance Score
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Detailed analytics coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyPopup;
