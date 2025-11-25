
import React, { useEffect, useState } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  doorName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, doorName, onClose, onConfirm }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
        <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
          <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-900">削除の確認</h3>
            <p className="text-red-700 text-sm mt-1">この操作は取り消せません。</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-base leading-relaxed">
            <span className="font-bold text-gray-900">{doorName}</span> をリストから削除してもよろしいですか？
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>削除する</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
