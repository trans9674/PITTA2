
import React, { useState, useEffect } from 'react';
import { ProjectInfo, ColorOption, DoorOption, HandleId } from '../types';
import { PREFECTURES } from '../constants';

interface ProjectInfoModalProps {
  isOpen: boolean;
  initialInfo: ProjectInfo;
  onComplete: (info: ProjectInfo) => void;
  onSkip: () => void;
  shippingRates: Record<string, number>;
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
}

const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, initialInfo, onComplete, onSkip, shippingRates, colors, handles }) => {
  const [info, setInfo] = useState<ProjectInfo>(initialInfo);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Preserve existing defaults if re-opening, or set safe defaults
      setInfo(prev => ({
          ...initialInfo,
          defaultHeight: prev.defaultHeight || 220,
          defaultColor: prev.defaultColor || (colors[0]?.id as any) || 'ww',
          defaultHandle: prev.defaultHandle || (handles[0]?.id as any) || 'satin-nickel'
      }));
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialInfo, colors, handles]);

  if (!visible) return null;

  const handleChange = (key: keyof ProjectInfo, value: string | number) => {
    if (key === 'constructionLocation') {
      // Use the passed shippingRates prop instead of the constant
      const cost = shippingRates[value as string] || 0;
      setInfo(prev => ({ ...prev, [key]: value as string, shippingCost: cost }));
    } else {
      setInfo(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(info);
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-500 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'} max-h-[90vh] overflow-y-auto`}>
        
        {/* Hero Section / Header */}
        <div className="relative bg-black p-8 text-white text-center overflow-hidden flex-shrink-0">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay blur-xl"></div>
                <div className="absolute top-20 right-10 w-20 h-20 bg-gray-500 rounded-full mix-blend-overlay blur-lg"></div>
                <div className="absolute -bottom-10 left-20 w-60 h-60 bg-gray-700 rounded-full mix-blend-overlay blur-2xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md shadow-inner border border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 22V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m18 14-4.243-4.243a2 2 0 0 0-2.828 0L8 12.586V22" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m18 14-4-4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">PITTA</h2>
                <p className="text-gray-300 text-sm mt-2 font-medium">まずはじめに初期設定を行いましょう。</p>
            </div>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Customer Name */}
            <div className="group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">お客様名</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={info.customerName}
                        onChange={(e) => handleChange('customerName', e.target.value)}
                        placeholder="例：山田 太郎"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all"
                    />
                </div>
            </div>

            {/* Location */}
            <div className="group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    建築地
                    <span className="ml-2 text-[10px] font-normal text-gray-400 tracking-normal">【送料の計算に反映されます】</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <select
                        value={info.constructionLocation}
                        onChange={(e) => handleChange('constructionLocation', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all appearance-none"
                    >
                        <option value="">都道府県を選択</option>
                        {PREFECTURES.map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Company */}
            <div className="group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">建築会社名</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={info.constructionCompany}
                        onChange={(e) => handleChange('constructionCompany', e.target.value)}
                        placeholder="例：株式会社〇〇工務店"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all"
                    />
                </div>
            </div>

            {/* Default Settings Section */}
            <div className="border-t-2 border-dashed border-gray-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-black rounded-full"></span>
                    標準仕様設定
                    <span className="text-[10px] font-normal text-gray-400 ml-1 bg-gray-50 px-2 py-0.5 rounded">入力の手間を省きます</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                    {/* Default Height */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">主なドア高さ</label>
                        <select
                            value={info.defaultHeight}
                            onChange={(e) => handleChange('defaultHeight', Number(e.target.value))}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="200">200 cm</option>
                            <option value="220">220 cm</option>
                            <option value="240">240 cm</option>
                        </select>
                    </div>

                    {/* Default Color */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">主なドアの色</label>
                        <select
                            value={info.defaultColor}
                            onChange={(e) => handleChange('defaultColor', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                        >
                            {colors.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Default Handle */}
                    <div className="group">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">主なハンドル</label>
                        <select
                            value={info.defaultHandle}
                            onChange={(e) => handleChange('defaultHandle', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                        >
                            {handles.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex flex-col gap-3">
                <button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-gray-400 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                <span>この内容でスタート</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                </button>
                
                <button
                type="button"
                onClick={onSkip}
                className="w-full text-gray-400 font-medium py-2 hover:text-gray-600 text-sm transition-colors"
                >
                あとで入力する（スキップ）
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
    