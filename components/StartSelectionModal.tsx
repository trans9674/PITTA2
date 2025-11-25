
import React, { useEffect, useState } from 'react';

interface StartSelectionModalProps {
  isOpen: boolean;
  count: number;
  onStart: (roomName: string) => void;
}

const StartSelectionModal: React.FC<StartSelectionModalProps> = ({ isOpen, count, onStart }) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setRoomName(''); // Reset input when opened
      // Small delay to allow CSS transition to catch the mounting
      setTimeout(() => setAnimating(true), 10);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onStart(roomName);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleSubmit}
      />

      {/* Modal Content */}
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 ${animating ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}
      >
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white">
            {count}
        </div>

        {/* Close Button */}
        <button
            onClick={handleSubmit}
            className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 p-2 rounded-full transition-colors z-10"
            aria-label="閉じる"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-black text-3xl mr-1">{count}</span>
                つめの<br/>セレクトを開始します。
            </h2>
            
            <div className="pt-2">
                <label htmlFor="roomNameInput" className="block text-sm font-bold text-gray-700 mb-2 text-left pl-1">
                    どの部屋に使いますか？（後でも入力できます）
                </label>
                <input
                    id="roomNameInput"
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="例：主寝室、子供部屋A"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-800 placeholder-gray-400 bg-gray-50"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSubmit();
                        }
                    }}
                />
            </div>

            <button
                onClick={handleSubmit}
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 mt-4"
            >
                <span>スタート！</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default StartSelectionModal;
