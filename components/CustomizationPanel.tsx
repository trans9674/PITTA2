
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DoorConfiguration, DoorOption, ColorOption, DoorTypeId, ColorId, HandleId, GlassStyleId, FrameTypeId, LockId } from '../types';

interface CustomizationPanelProps {
  config: DoorConfiguration;
  updateConfig: <K extends keyof DoorConfiguration>(key: K, value: DoorConfiguration[K]) => void;
  totalPrice: number;
  onAddToList: () => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
  glassStyles: DoorOption<GlassStyleId>[];
  locks: DoorOption<LockId>[];
}

const getPriceForHeight = (option: { price: number; priceH2200: number; priceH2400: number; priceH90?: number; priceH120?: number }, height: number): number => {
  if (option.priceH90 !== undefined && height <= 90) return option.priceH90;
  if (option.priceH120 !== undefined && height <= 120) return option.priceH120;
  if (height <= 200) return option.price;
  if (height <= 220) return option.priceH2200;
  return option.priceH2400;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-black pl-3">{children}</h3>
);

const SectionCard: React.FC<{ children: React.ReactNode; className?: string; innerRef?: React.Ref<HTMLDivElement> }> = ({ children, className = '', innerRef }) => (
  <div ref={innerRef} className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 ${className}`}>
    {children}
  </div>
);

const OptionButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`w-full text-center px-4 py-3 text-sm rounded-lg transition-all duration-200 border ${
      active ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
    }`}
  >
    {children}
  </button>
);

const ColorSwatch: React.FC<{ color: ColorOption; active: boolean; onClick: () => void; }> = ({ color, active, onClick }) => (
  <button onClick={onClick} className={`text-center transition-all duration-200 group ${active ? 'transform scale-105' : 'hover:scale-105'}`}>
    <div className={`relative w-[80%] mx-auto aspect-square rounded-lg border-4 shadow-sm overflow-hidden ${active ? 'border-black shadow-md' : 'border-transparent group-hover:border-gray-200'}`}>
      <img src={color.swatchUrl} alt={color.name} className="w-full h-full object-cover" />
      {/* WW用の枠線（白だと背景に溶け込むため） */}
      {color.id === 'ww' && (
        <div className="absolute inset-0 border border-gray-300 rounded-lg pointer-events-none"></div>
      )}
    </div>
    <p className="mt-2 text-sm font-bold text-gray-800">{color.shortId}</p>
    <p className="text-xs text-gray-600 truncate">{color.name}</p>
  </button>
);

// Helper to find which category a door ID belongs to
const findCategory = (id: string, types: DoorOption<DoorTypeId>[]) => {
    return types.find(t => t.subOptions?.some(sub => sub.id === id));
}

// Icon component for door categories
const DoorCategoryIcon: React.FC<{ id: string, className?: string }> = ({ id, className }) => {
  const commonProps = {
    className: className || "h-12 w-12",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5
  };

  switch (id) {
    case 'hinged':
    case 'hinged-storage':
      return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" /><path d="M15 12h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'sliding-single':
      // Simple icon: Left door rectangle, right frame outline
      return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h6v16H6z M13 4h6v16" /></svg>;
    case 'sliding':
      return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v16H4zM13 4h7v16h-7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11 8l-4 4 4 4M13 8l4 4-4 4" /></svg>;
    case 'folding':
      return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h2v16H4zM8 4h2v16H8zM12 4h2v16h-2zM16 4h2v16h-2zM20 4h-2v16h2z" /></svg>;
    case 'double':
         return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M5 4h5v16H5zM14 4h5v16h-5z" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
    case 'storage':
      return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    case 'material':
       return <svg {...commonProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
    default:
      return null;
  }
};

// Image Preview Modal
const ImagePreviewModal: React.FC<{ 
    isOpen: boolean; 
    imageUrl: string; 
    altText: string;
    onClose: () => void; 
}> = ({ isOpen, imageUrl, altText, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img src={imageUrl} alt={altText} className="w-full h-full object-contain" />
            </div>
        </div>
    );
};

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ 
  config, 
  updateConfig, 
  totalPrice, 
  onAddToList,
  isEditing = false,
  onCancelEdit,
  doorTypes,
  frameTypes,
  colors,
  handles,
  glassStyles,
  locks
}) => {
  const [showFrameInfo, setShowFrameInfo] = useState(false);
  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const [heightError, setHeightError] = useState<string | null>(null);

  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const [isDoorTypeSectionOpen, setIsDoorTypeSectionOpen] = useState(true);

  // State for Drill-down Navigation
  const [currentCategory, setCurrentCategory] = useState<DoorOption<DoorTypeId> | null>(null);
  
  // Image Preview State
  const [previewImage, setPreviewImage] = useState<{url: string, alt: string} | null>(null);

  // Refs for auto-scrolling
  const panelRef = useRef<HTMLDivElement>(null);
  const hingeSectionRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);

  // Sync UI state when config changes externally (e.g. list selection, reset)
  useEffect(() => {
    if (config.doorType === 'unselected') {
      setAreOptionsVisible(false);
      setIsDoorTypeSectionOpen(true);
      setCurrentCategory(null);
    } else {
      setAreOptionsVisible(true);
      // If a specific door type is selected, ensure we are showing the correct category
      const category = findCategory(config.doorType, doorTypes);
      if (category) {
        setCurrentCategory(category);
      } else {
        // If it's a root level item (like Hinged), ensure we are at root
        setCurrentCategory(null);
      }
    }
  }, [config.doorType, doorTypes]);

  const handleDoorTypeSelect = (id: DoorTypeId) => {
    updateConfig('doorType', id);
    if (!areOptionsVisible) {
      setAreOptionsVisible(true);
    }
  };

  const handleCategorySelect = (category: DoorOption<DoorTypeId>) => {
    if (category.subOptions && category.subOptions.length > 0) {
      setCurrentCategory(category);
      
      // If it's storage, auto-select the first option to ensure a valid config
      if (category.id === 'storage' && category.subOptions) {
          handleDoorTypeSelect(category.subOptions[0].id);
      }
    } else {
      handleDoorTypeSelect(category.id);
    }
  };

  const handleSectionHeaderClick = () => {
      if (currentCategory) {
          setCurrentCategory(null);
      } else {
          setIsDoorTypeSectionOpen(prev => !prev);
      }
  };

  const handleAddToListClick = () => {
    onAddToList();
    
    // Scroll panel to top
    if (panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const presetWidths = useMemo(() => {
    if (config.doorType.startsWith('storage-')) {
      return [80, 120, 160, 200];
    }
    if (config.doorType === 'hinged-storage') {
      return [43.5];
    }
    if (config.doorType === 'double') {
      return [73.5, 120];
    }
    if (config.doorType === 'sliding-outset') {
      return [77.8, 77.81];
    }
    if (['sliding-inset', 'sliding-hikikomi'].includes(config.doorType)) {
      return [145, 164.5];
    }
    if (config.doorType === 'sliding-2') {
        return [145, 164.5];
    }
    if (config.doorType === 'sliding-kata-2') {
        return [243.1];
    }
    if (config.doorType === 'sliding-kata-3') {
        return [321.5];
    }
    if (config.doorType === 'sliding-3') {
        return [242];
    }
    if (config.doorType === 'sliding-4') {
        return [324.4];
    }
    if (config.doorType.startsWith('folding')) {
        switch(config.doorType) {
            case 'folding-2': return [73.5];
            case 'folding-4': return [120, 164.5];
            case 'folding-6': return [245.1];
            case 'folding-8': return [325.8];
            default: return [75, 80, 85];
        }
    }
    if (config.doorType.startsWith('sliding-')) {
      return [160, 180, 240, 320];
    }
    if (config.doorType === 'hinged') {
      return [65, 73.5, 75.5, 77.8, 85];
    }
    return [65, 70, 75, 80];
  }, [config.doorType]);

  const presetHeights = useMemo(() => {
    if (config.doorType === 'hinged-storage' || config.doorType === 'double') {
      return [90, 120, 200, 220, 240];
    }
    return [200, 220, 240];
  }, [config.doorType]);

  // Effect to reset width when door type changes and current width is not in the new presets.
  useEffect(() => {
    if (!config.doorType.startsWith('material-') && !presetWidths.includes(config.width)) {
      updateConfig('width', presetWidths[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetWidths]);
  
  useEffect(() => {
    if (config.height === 200 && !config.doorType.startsWith('storage-') && !config.doorType.startsWith('material-') && config.doorType !== 'hinged-storage' && config.doorType !== 'double') {
      setIsHeightModalOpen(true);
    }
  }, [config.height, config.doorType]);

  const [widthSelection, setWidthSelection] = useState<'preset' | 'custom'>(
    () => presetWidths.includes(config.width) ? 'preset' : 'custom'
  );
  const [customWidth, setCustomWidth] = useState<number>(config.width);

  useEffect(() => {
    const isPreset = presetWidths.includes(config.width);
    setWidthSelection(isPreset ? 'preset' : 'custom');
    if (!isPreset) {
      setCustomWidth(config.width);
    }
  }, [config.width, presetWidths]);


  const isInitialHeightPreset = presetHeights.includes(config.height);
  const [heightSelection, setHeightSelection] = useState<'preset' | 'custom'>(
    isInitialHeightPreset ? 'preset' : 'custom'
  );
  const [customHeight, setCustomHeight] = useState<number | ''>(
    isInitialHeightPreset ? (presetHeights.includes(200) ? 200 : presetHeights[0]) : config.height
  );

  // --- Handlers for Width ---
  const handlePresetWidthClick = (width: number) => {
    if (width === 200 && config.doorType === 'storage-200-full') {
      alert('サイズがありませんので他のサイズを選んでください');
      updateConfig('width', 160);
    } else {
      setWidthSelection('preset');
      updateConfig('width', width);
    }
  };
  
  const handleCustomWidthClick = () => {
    if (widthSelection === 'custom') return;
    setWidthSelection('custom');
    updateConfig('width', customWidth);
  };

  const handleCustomWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value); 
    const numericValue = isNaN(value) ? config.width : value;
    setCustomWidth(numericValue);
    
    if (numericValue === 200 && config.doorType === 'storage-200-full') {
        alert('サイズがありませんので他のサイズを選んでください');
        updateConfig('width', 160);
    } else {
        setWidthSelection('custom'); 
        updateConfig('width', numericValue);
    }
  };
  
  // --- Handlers for Height ---
  const handlePresetHeightClick = (height: number) => {
    setHeightSelection('preset');
    setHeightError(null);
    updateConfig('height', height);
  };

  const handleCustomHeightClick = () => {
    if (heightSelection === 'custom') return;
    setHeightSelection('custom');
    setCustomHeight('');
    setHeightError(null);
  };

  const handleCustomHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (!rawValue) {
        setCustomHeight('');
        return;
    }

    const value = parseInt(rawValue, 10);
    setCustomHeight(value);
    setHeightSelection('custom');

    if (value > 240) {
        setHeightError('最大値を超えています');
    } else {
        setHeightError(null);
        updateConfig('height', value);
    }
  };

  useEffect(() => {
      if (presetHeights.includes(config.height)) {
          setHeightSelection('preset');
      } else {
          setHeightSelection('custom');
          if (typeof customHeight === 'number' && customHeight !== config.height) {
            setCustomHeight(config.height);
          }
      }
  }, [config.height, presetHeights]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    updateConfig('count', isNaN(value) || value < 1 ? 1 : value);
  };

  const isStorage = config.doorType.startsWith('storage-');
  const isMaterial = config.doorType.startsWith('material-');

  const isMultiPanelSliding = ['sliding-2', 'sliding-3', 'sliding-kata-2', 'sliding-kata-3', 'sliding-4'].includes(config.doorType);
  const isFolding = config.doorType.startsWith('folding-');
  const isDouble = config.doorType === 'double';
  const isHingedStorage = config.doorType === 'hinged-storage';
  const showFrameTypeOption = !isStorage && !isMaterial && !isMultiPanelSliding && !isFolding && !isDouble && !isHingedStorage;

  const isCornerSkirting = config.doorType === 'material-corner-skirting';
  const showGlassOption = ['hinged', 'sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
  const showHingeSideOption = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(config.doorType);
  const showHandleOption = !['double', 'hinged-storage'].includes(config.doorType) && !config.doorType.startsWith('folding-') && !isStorage && !isMaterial;
  const showHeightOption = !isStorage && !isMaterial;
  const showWidthOption = !isMaterial;
  const shouldShowHandle = showHandleOption || config.doorType.startsWith('sliding-');
  const showLockOption = ['hinged', 'sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);

  const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
  const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(config.doorType);
  const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(config.doorType);
  const isSlidingDoor = isPocketSliding || isKataSliding;
  const isFoldingDoor = config.doorType === 'folding-2';

  // Default images logic (omitted for brevity, assume same)
  let leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/hirakir.jpg';
  let rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/hirakil.jpg';
  if (config.doorType === 'sliding-outset') {
      leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/otL.jpg';
      rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/otR.jpg';
  } else if (config.doorType === 'sliding-kata-2') {
      leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/2hikikomiL.jpg';
      rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/2hikikomiR.jpg';
  } else if (config.doorType === 'sliding-kata-3') {
      leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/3hikikomiL.jpg';
      rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/3hikikomiR.jpg';
  } else if (isSlidingDoor) {
      leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/hikidol.jpg';
      rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/hikidor.jpg';
  } else if (isFoldingDoor) {
      leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/oredol.jpg';
      rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/oredor.jpg';
  } else if (isStorageLR) {
      // Use placeholder images or icons for Storage L/R if not provided
      // For now reusing folding door icons as placeholder to indicate "direction"
      leftHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/hirakir.jpg'; // Placeholder
      rightHingeImg = 'http://25663cc9bda9549d.main.jp/aistudio/door/hirakil.jpg'; // Placeholder
  }

  const leftLabel = isPocketSliding ? '左戸袋' : isKataSliding ? '左勝手' : isStorageLR ? 'Lタイプ' : '右吊元';
  const rightLabel = isPocketSliding ? '右戸袋' : isKataSliding ? '右勝手' : isStorageLR ? 'Rタイプ' : '左吊元';
  const titleLabel = isPocketSliding ? '戸袋' : isKataSliding ? '勝手' : isStorageLR ? 'タイプ' : '吊元';

  const hingeSideSection = (
    <SectionCard innerRef={hingeSectionRef} className="scroll-mt-4">
      <SectionTitle>{titleLabel}</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <OptionButton active={config.hingeSide === 'left'} onClick={() => updateConfig('hingeSide', 'left')}>
          <div className="flex flex-col items-center">
            <span>{leftLabel}</span>
            {!isStorageLR && <img src={leftHingeImg} alt={leftLabel} className="h-16 mt-2 object-contain" />}
          </div>
        </OptionButton>
        <OptionButton active={config.hingeSide === 'right'} onClick={() => updateConfig('hingeSide', 'right')}>
          <div className="flex flex-col items-center">
            <span>{rightLabel}</span>
            {!isStorageLR && <img src={rightHingeImg} alt={rightLabel} className="h-16 mt-2 object-contain" />}
          </div>
        </OptionButton>
      </div>
    </SectionCard>
  );

  // Reusable Size Selector
  const renderSizeSelector = () => (
    <div className="mb-6">
        <label className="block text-sm font-bold text-gray-600 mb-3">サイズ (cm)</label>
        <div className={`grid grid-cols-${presetWidths.length >= 5 ? 5 : (presetWidths.length >= 4 ? 4 : 3)} gap-2`}>
        {presetWidths.map((w, index) => {
            let tagLabel = null;
            let tagColor = '';
            // Tag logic
            if (config.doorType === 'hinged') {
                if (w === 77.8) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; } 
                else if (w === 75.5 || w === 73.5) { tagLabel = '入隅'; tagColor = 'bg-orange-100 text-orange-800'; }
            } else if (config.doorType === 'sliding-outset') {
                if (w === 77.8 && index === 0) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
                else if (w > 77.8 && index === 1) { tagLabel = '入隅'; tagColor = 'bg-orange-100 text-orange-800'; }
            } else if (['sliding-inset', 'sliding-hikikomi', 'sliding-2', 'folding-4'].includes(config.doorType)) {
                if (w === 164.5) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
                else if (w === 145 && config.doorType !== 'folding-4') { tagLabel = '入隅'; tagColor = 'bg-orange-100 text-orange-800'; }
                else if (config.doorType === 'folding-4' && w === 120) { tagLabel = '4尺5寸用'; tagColor = 'bg-gray-200 text-gray-800'; }
            } else if (config.doorType === 'sliding-3' && w === 242) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
            else if (config.doorType === 'sliding-kata-3' && w === 321.5) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
            else if (config.doorType === 'sliding-4' && w === 324.4) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
            else if (['folding-2', 'double'].includes(config.doorType) && w === 73.5) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
            else if (config.doorType === 'folding-6' && w === 245.1) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
            else if (config.doorType === 'folding-8' && w === 325.8) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }
            else if (config.doorType === 'sliding-kata-2' && w === 243.1) { tagLabel = '通常'; tagColor = 'bg-green-100 text-green-800'; }

            const isSelected = widthSelection === 'preset' && config.width === w;

            return (
            <button
            key={w}
            onClick={() => handlePresetWidthClick(w)}
            className={`w-full text-center py-3 text-sm rounded-lg transition-all duration-200 flex flex-col items-center justify-center border ${
                isSelected ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
            } ${tagLabel ? 'min-h-[4rem]' : ''}`}
            >
            <span className="font-bold">{w.toFixed(1)} cm</span>
            {tagLabel && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 leading-tight font-bold ${isSelected ? 'bg-white/90 text-black' : tagColor}`}>
                    {tagLabel}
                </span>
            )}
            </button>
        )})}
        {!isStorage && (
            <button
                onClick={handleCustomWidthClick}
                className={`w-full text-center py-3 text-sm rounded-lg transition-all duration-200 flex flex-col items-center justify-center border ${
                    widthSelection === 'custom' ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                }`}
            >
                その他
            </button>
        )}
        </div>
        {widthSelection === 'custom' && !isStorage && (
        <div className="mt-3 relative animate-fade-in-out" style={{ animationDuration: '0.3s', animationName: 'none', opacity: 1, transform: 'none' }}>
            <input
                type="number"
                id="customWidth"
                value={customWidth}
                onChange={handleCustomWidthInputChange}
                className="w-full pl-4 pr-12 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-lg text-gray-900 bg-gray-50"
                placeholder="幅を入力"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 font-medium">cm</span>
        </div>
        )}
    </div>
  );
  
  const monotoneColors = colors.filter(c => c.category === 'monotone');
  const woodColors = colors.filter(c => c.category === 'wood');

  const displayedMonotoneColors = isMaterial 
    ? monotoneColors.filter(c => c.id === 'ww') 
    : monotoneColors;
  
  const displayedWoodColors = isMaterial 
    ? [] 
    : woodColors;

  return (
    <div 
      ref={panelRef} 
      className="w-full lg:w-[38.5rem] bg-gray-50 p-6 lg:h-full lg:overflow-y-auto relative z-10"
      style={{ boxShadow: "-12px 0 35px -5px rgba(0, 0, 0, 0.2)" }}
    >
      <ImagePreviewModal 
        isOpen={!!previewImage} 
        imageUrl={previewImage?.url || ''} 
        altText={previewImage?.alt || ''} 
        onClose={() => setPreviewImage(null)} 
      />

      <div className="space-y-10">
        <SectionCard>
          <button
            className="w-full flex justify-between items-center text-left mb-2"
            onClick={handleSectionHeaderClick}
          >
            <SectionTitle>
                {currentCategory ? `ドア種類 / ${currentCategory.name}` : 'ドア種類 / 造作材'}
            </SectionTitle>
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               className={`h-6 w-6 text-gray-500 transition-transform ${isDoorTypeSectionOpen && !currentCategory ? 'rotate-180' : ''}`} 
               viewBox="0 0 20 20" 
               fill="currentColor"
             >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
          </button>
          
          {isDoorTypeSectionOpen && (
            <div className="pt-2">
              {!currentCategory ? (
                // Root View (Categories)
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {doorTypes.map(dt => {
                    const isLeaf = !dt.subOptions;
                    const isSelected = isLeaf && config.doorType === dt.id;
                    return (
                      <button
                        key={dt.id}
                        onClick={() => handleCategorySelect(dt)}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected ? 'border-black bg-gray-100 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                        }`}
                      >
                        <DoorCategoryIcon 
                          id={dt.id} 
                          className={`h-12 w-12 mb-2 transition-colors duration-200 ${isSelected ? 'text-black' : 'text-black group-hover:text-gray-700'}`} 
                        />
                        <span className={`font-bold text-sm text-center ${isSelected ? 'text-black' : 'text-gray-800'}`}>{dt.name}</span>
                        {!isLeaf && (
                          <span className="absolute bottom-2 right-2 text-gray-300 group-hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Sub View (Sub-options)
                <div className="space-y-3 animate-fade-in-out" style={{ animationDuration: '0.2s', animationName: 'none' }}>
                  
                  {/* FOR STORAGE: Render Size Selector HERE (First) */}
                  {currentCategory.id === 'storage' && (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        {renderSizeSelector()}
                    </div>
                  )}

                  <div className="space-y-2">
                    {currentCategory.subOptions?.map(sub => {
                      let price = 0;
                      if (sub.id.startsWith('storage-')) {
                          // Display price based on currently selected width
                          if (config.width === 80) price = sub.priceW80 || sub.price;
                          else if (config.width === 120) price = sub.priceW120 || 0;
                          else if (config.width === 160) price = sub.priceW160 || 0;
                          else if (config.width === 200) price = sub.priceW200 || 0;
                          else price = sub.price;
                      } else if (sub.id.startsWith('material-')) {
                          price = sub.price;
                      } else {
                          price = getPriceForHeight(sub, config.height);
                      }

                      const showIcon = sub.id === 'storage-80' || sub.id === 'material-skirting';
                      const imageUrl = sub.id === 'storage-80' 
                          ? 'https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/shoescounter.JPG'
                          : 'https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/slimhabaki.JPG';
                      
                      const isStorageL = sub.id === 'storage-200-l';
                      const isStorageU = sub.id === 'storage-200-u';
                      const isStorageTall = sub.id === 'storage-200-full';
                      const isDisabled = (config.width === 80 && (isStorageL || isStorageU)) || (config.width === 200 && isStorageTall);

                      return (
                        <div key={sub.id} className="flex gap-2">
                            <button
                            onClick={() => {
                                if (isDisabled) return;
                                handleDoorTypeSelect(sub.id)
                            }}
                            className={`flex-grow flex justify-between items-center text-left px-5 py-4 text-sm rounded-xl border transition-all duration-200 ${
                                isDisabled 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100' 
                                : sub.id === config.doorType 
                                    ? 'bg-black text-white border-black shadow-md' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                            >
                            <span className="font-bold">{sub.name}</span>
                            <span className={`opacity-90 text-[15px] ${isDisabled ? 'text-gray-400' : ''}`}>¥{price.toLocaleString()}</span>
                            </button>
                            {showIcon && (
                                <button 
                                    className="flex-shrink-0 w-14 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewImage({ url: imageUrl, alt: sub.name });
                                    }}
                                    title="画像を確認"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {areOptionsVisible && (
          <>
            {showHingeSideOption && !config.doorType.startsWith('folding') && hingeSideSection}

            {isMaterial && (
              <SectionCard>
                <SectionTitle>数量</SectionTitle>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-gray-700 font-bold">{currentCategory?.subOptions?.find(o=>o.id === config.doorType)?.name}</span>
                  <div className="flex-grow"></div>
                  <input
                    type="number"
                    min="1"
                    value={config.count || 1}
                    onChange={handleCountChange}
                    className="w-24 px-3 py-2 text-lg font-bold text-right border border-gray-300 rounded focus:ring-2 focus:ring-black focus:outline-none bg-white text-gray-900"
                  />
                  <span className="text-gray-700 font-medium">{isCornerSkirting ? '個' : '本'}</span>
                </div>
              </SectionCard>
            )}

            {/* Main Size Section (Hidden for Materials AND Storage since Storage is now above) */}
            {!isMaterial && !isStorage && (
            <SectionCard innerRef={sizeSectionRef} className="scroll-mt-4">
              <SectionTitle>サイズ (cm)</SectionTitle>
              <div className="space-y-6">
                {showWidthOption && renderSizeSelector()}
                
                { showHeightOption && (
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-3">高さ</label>
                  <div className={`grid grid-cols-${Math.min(presetHeights.length + 1, 5)} gap-2`}>
                    {presetHeights.map(h => (
                      <button
                        key={h}
                        onClick={() => handlePresetHeightClick(h)}
                        className={`w-full text-center py-3 text-sm rounded-lg transition-all duration-200 border ${
                          heightSelection === 'preset' && config.height === h ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <span className="font-bold">{h} cm</span>
                      </button>
                    ))}
                    <button
                        onClick={handleCustomHeightClick}
                        className={`w-full text-center py-3 text-sm rounded-lg transition-all duration-200 border ${
                            heightSelection === 'custom' ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                    >
                        その他
                    </button>
                  </div>
                  {heightSelection === 'custom' && (
                    <div className="mt-3 relative animate-fade-in-out" style={{ animationDuration: '0.3s', animationName: 'none', opacity: 1, transform: 'none' }}>
                        <input
                          type="number"
                          id="customHeight"
                          value={customHeight}
                          onChange={handleCustomHeightInputChange}
                          className={`w-full pl-4 pr-12 py-3 text-base border ${heightError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} focus:outline-none rounded-lg text-gray-900 bg-gray-50`}
                          placeholder="高さを入力"
                        />
                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 font-medium">cm</span>
                        {heightError && <p className="text-red-500 text-xs mt-1 pl-1">{heightError}</p>}
                    </div>
                  )}
                </div>
                )}
              </div>
            </SectionCard>
            )}
            
            {showHingeSideOption && config.doorType.startsWith('folding') && hingeSideSection}
            
            {showFrameTypeOption && (
              <SectionCard>
                <div className="flex items-center gap-4 mb-4">
                  <SectionTitle>枠種類</SectionTitle>
                  <div className="relative -mt-2">
                    <button
                      onClick={() => setShowFrameInfo(true)}
                      className="text-gray-400 hover:text-black transition-colors flex items-center bg-gray-100 rounded-full p-1 hover:bg-gray-200"
                      aria-label="枠種類に関する情報を表示"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {frameTypes.map(f => {
                    const price = getPriceForHeight(f, config.height);
                    return (
                    <button
                      key={f.id}
                      onClick={() => updateConfig('frameType', f.id)}
                      className={`w-full flex justify-between items-center text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 border ${
                        f.id === config.frameType ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <span className="font-bold">{f.name}</span>
                      <span className="opacity-90 text-[15px]">¥{price.toLocaleString()}</span>
                    </button>
                  )})}
                </div>
              </SectionCard>
            )}

            <SectionCard>
              <SectionTitle>カラー</SectionTitle>
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center uppercase tracking-wider">
                  <span className="inline-block w-1.5 h-4 bg-gray-400 mr-2 rounded-full"></span>
                  <span>Monotone Color / 単色</span>
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {displayedMonotoneColors.map(c => (
                    <ColorSwatch key={c.id} color={c} active={config.color === c.id} onClick={() => updateConfig('color', c.id)} />
                  ))}
                </div>
              </div>

              {displayedWoodColors.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center uppercase tracking-wider">
                  <span className="inline-block w-1.5 h-4 bg-gray-400 mr-2 rounded-full"></span>
                  <span>Wood Texture / 木目</span>
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {displayedWoodColors.map(c => (
                    <ColorSwatch key={c.id} color={c} active={config.color === c.id} onClick={() => updateConfig('color', c.id)} />
                  ))}
                </div>
              </div>
              )}
            </SectionCard>
            
            {shouldShowHandle && (
              <SectionCard>
                <SectionTitle>ドアハンドル</SectionTitle>
                <div className="space-y-3">
                  {handles.map(h => {
                    const price = getPriceForHeight(h, config.height);
                    return (
                    <button
                      key={h.id}
                      onClick={() => updateConfig('handle', h.id)}
                      className={`w-full flex justify-between items-center text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 border ${
                        h.id === config.handle ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <span className="font-bold">{h.name}</span>
                      <span className="opacity-90 text-[15px]">¥{price.toLocaleString()}</span>
                    </button>
                  )})}
                </div>
              </SectionCard>
            )}

            {showLockOption && (
              <SectionCard>
                <SectionTitle>錠</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {locks.map(l => {
                    const price = getPriceForHeight(l, config.height);
                    return (
                      <button
                        key={l.id}
                        onClick={() => updateConfig('lock', l.id)}
                        className={`w-full flex justify-between items-center text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 border ${
                          l.id === config.lock ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <span className="font-bold">{l.name}</span>
                        <span className="opacity-90 text-[15px]">¥{price.toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {showGlassOption && (
              <SectionCard>
                <SectionTitle>ガラス</SectionTitle>
                <div className="space-y-3">
                  {glassStyles.map(g => {
                    const price = getPriceForHeight(g, config.height);
                    return (
                    <button
                      key={g.id}
                      onClick={() => updateConfig('glassStyle', g.id)}
                      className={`w-full flex justify-between items-center text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 border ${
                        g.id === config.glassStyle ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <span className="font-bold">{g.name}</span>
                      <span className="opacity-90 text-[15px]">¥{price.toLocaleString()}</span>
                    </button>
                  )})}
                </div>
              </SectionCard>
            )}
            
            <SectionCard className="bg-gray-50 border-gray-200">
                <div className="text-right mb-6">
                    <p className="text-sm text-gray-600 mb-1 font-medium">セット金額</p>
                    <p className="text-4xl font-bold text-gray-800 tracking-tight">¥{totalPrice.toLocaleString()}<span className="text-xl ml-1 font-medium text-gray-500"></span></p>
                    <p className="text-xs text-gray-400 mt-1">（税別･送料別）</p>
                </div>
                {isEditing ? (
                    <div className="flex gap-3">
                        <button
                          onClick={handleAddToListClick}
                          className="flex-[2] bg-black text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-gray-900 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>修正を登録</span>
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="flex-1 bg-gray-500 text-white font-bold py-4 px-4 rounded-xl shadow-md hover:bg-gray-600 transition-all duration-300 flex items-center justify-center text-base"
                        >
                          キャンセル
                        </button>
                    </div>
                ) : (
                    <button
                      onClick={handleAddToListClick}
                      className="w-full bg-black text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-gray-900 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span>リストに追加</span>
                    </button>
                )}
            </SectionCard>
          </>
        )}
      </div>

      {isHeightModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
          onClick={() => setIsHeightModalOpen(false)}
        >
          <div 
            className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsHeightModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-black mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-lg font-bold text-gray-800">下がり壁がある場合には<br/>3方枠を選択してください。</p>
          </div>
        </div>
      )}
      
      {showFrameInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowFrameInfo(false)}
          ></div>
          <div className="relative bg-white p-8 rounded-xl shadow-2xl max-w-md w-full z-10 animate-fade-in-out" style={{ animationDuration: '0.2s', animationName: 'none' }}>
            <button 
                onClick={() => setShowFrameInfo(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">枠について</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-6 font-medium">
              枠の形状を見付11㎜にすることにより、枠が目立たず、扉本体を引き立たせ、空間にスタイリッシュな印象を与えます。
            </p>
            <img src="http://25663cc9bda9549d.main.jp/aistudio/door/2houwaku.JPG" alt="2方枠イメージ" className="w-full rounded-lg border border-gray-200 mb-6" />
            
            <div className="flex justify-start">
                <button 
                    onClick={() => setShowFrameInfo(false)}
                    className="bg-black text-white text-sm font-bold px-8 py-3 rounded hover:bg-gray-800 transition-colors"
                >
                    閉じる
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationPanel;
