
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDoorConfiguration } from './hooks/useDoorConfiguration';
import CustomizationPanel from './components/CustomizationPanel';
import DoorPreview from './components/DoorPreview';
import DoorList from './components/DoorList';
import AdminPanel from './components/AdminPanel';
import PasswordModal from './components/PasswordModal';
import StartSelectionModal from './components/StartSelectionModal';
import ProjectInfoModal from './components/ProjectInfoModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { SavedDoor, ProjectInfo } from './types';
import { 
  DOOR_TYPES, COLORS, HANDLES, GLASS_STYLES, LOCKS, BASE_PRICE, PRICE_PER_SQ_CM, FRAME_TYPES, SHIPPING_RATES, DEFAULT_DIMENSION_SETTINGS, DEFAULT_MATRIX_PRICES
} from './constants';
import { generateDocument } from './components/PresentationGenerator';
import { generateBatchDetailDrawings } from './components/DetailDrawingGenerator';
import { getOptionName } from './utils';

const APP_SETTINGS_KEY = 'tripLineDoorAppSettings_v25';

// Helper to merge saved settings with defaults based on ID matching
const mergeOptions = (defaults: any[], saved: any[]): any[] => {
  if (!saved || !Array.isArray(saved)) return defaults;

  return defaults.map(defItem => {
    const savedItem = saved.find((s: any) => s.id === defItem.id);
    if (!savedItem) return defItem;
    const mergedItem = { ...defItem };

    if (typeof savedItem.price === 'number') mergedItem.price = savedItem.price;
    if (typeof savedItem.priceH2200 === 'number') mergedItem.priceH2200 = savedItem.priceH2200;
    if (typeof savedItem.priceH2400 === 'number') mergedItem.priceH2400 = savedItem.priceH2400;
    if (typeof savedItem.priceH90 === 'number') mergedItem.priceH90 = savedItem.priceH90;
    if (typeof savedItem.priceH120 === 'number') mergedItem.priceH120 = savedItem.priceH120;
    if (typeof savedItem.priceW80 === 'number') mergedItem.priceW80 = savedItem.priceW80;
    if (typeof savedItem.priceW120 === 'number') mergedItem.priceW120 = savedItem.priceW120;
    if (typeof savedItem.priceW160 === 'number') mergedItem.priceW160 = savedItem.priceW160;
    if (typeof savedItem.priceW200 === 'number') mergedItem.priceW200 = savedItem.priceW200;
    if (typeof savedItem.priceW80_R === 'number') mergedItem.priceW80_R = savedItem.priceW80_R;
    if (typeof savedItem.priceW120_R === 'number') mergedItem.priceW120_R = savedItem.priceW120_R;
    if (typeof savedItem.priceW160_R === 'number') mergedItem.priceW160_R = savedItem.priceW160_R;
    if (typeof savedItem.priceW200_R === 'number') mergedItem.priceW200_R = savedItem.priceW200_R;
    if (typeof savedItem.detailDrawingUrl === 'string') mergedItem.detailDrawingUrl = savedItem.detailDrawingUrl;
    if (typeof savedItem.detailDrawingUrl_R === 'string') mergedItem.detailDrawingUrl_R = savedItem.detailDrawingUrl_R;
    if (typeof savedItem.detailDrawingUrlW80 === 'string') mergedItem.detailDrawingUrlW80 = savedItem.detailDrawingUrlW80;
    if (typeof savedItem.detailDrawingUrlW120 === 'string') mergedItem.detailDrawingUrlW120 = savedItem.detailDrawingUrlW120;
    if (typeof savedItem.detailDrawingUrlW160 === 'string') mergedItem.detailDrawingUrlW160 = savedItem.detailDrawingUrlW160;
    if (typeof savedItem.detailDrawingUrlW200 === 'string') mergedItem.detailDrawingUrlW200 = savedItem.detailDrawingUrlW200;
    if (typeof savedItem.detailDrawingUrlW80_R === 'string') mergedItem.detailDrawingUrlW80_R = savedItem.detailDrawingUrlW80_R;
    if (typeof savedItem.detailDrawingUrlW120_R === 'string') mergedItem.detailDrawingUrlW120_R = savedItem.detailDrawingUrlW120_R;
    if (typeof savedItem.detailDrawingUrlW160_R === 'string') mergedItem.detailDrawingUrlW160_R = savedItem.detailDrawingUrlW160_R;
    if (typeof savedItem.detailDrawingUrlW200_R === 'string') mergedItem.detailDrawingUrlW200_R = savedItem.detailDrawingUrlW200_R;

    if (defItem.subOptions && Array.isArray(defItem.subOptions)) {
        const savedSubOptions = (savedItem.subOptions && Array.isArray(savedItem.subOptions)) 
            ? savedItem.subOptions 
            : [];
            
        mergedItem.subOptions = mergeOptions(defItem.subOptions, savedSubOptions);
    }

    return mergedItem;
  });
};

const App: React.FC = () => {
  const [appSettings, setAppSettings] = useState(() => {
    const defaults = {
      basePrice: BASE_PRICE,
      pricePerSqCm: PRICE_PER_SQ_CM,
      doorTypes: DOOR_TYPES,
      frameTypes: FRAME_TYPES,
      colors: COLORS,
      handles: HANDLES,
      glassStyles: GLASS_STYLES,
      locks: LOCKS,
      shippingRates: SHIPPING_RATES,
      dimensionSettings: DEFAULT_DIMENSION_SETTINGS,
      matrixPrices: DEFAULT_MATRIX_PRICES,
    };

    try {
      const savedSettingsJSON = localStorage.getItem(APP_SETTINGS_KEY);
      if (savedSettingsJSON) {
        const saved = JSON.parse(savedSettingsJSON);
        console.log("Loaded settings from storage:", saved);
        return {
          ...defaults,
          doorTypes: mergeOptions(defaults.doorTypes, saved.doorTypes),
          frameTypes: mergeOptions(defaults.frameTypes, saved.frameTypes),
          colors: mergeOptions(defaults.colors, saved.colors),
          handles: mergeOptions(defaults.handles, saved.handles),
          glassStyles: mergeOptions(defaults.glassStyles, saved.glassStyles),
          locks: mergeOptions(defaults.locks, saved.locks),
          basePrice: defaults.basePrice, 
          pricePerSqCm: defaults.pricePerSqCm,
          shippingRates: { ...defaults.shippingRates, ...(saved.shippingRates || {}) },
          dimensionSettings: { ...defaults.dimensionSettings, ...(saved.dimensionSettings || {}) },
          matrixPrices: { ...defaults.matrixPrices, ...(saved.matrixPrices || {}) },
        };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return defaults;
  });

  useEffect(() => {
    try {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(appSettings));
      console.log("Settings saved to localStorage");
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [appSettings]);


  const { config, updateConfig, loadConfig, totalPrice } = useDoorConfiguration(appSettings);
  const [savedDoors, setSavedDoors] = useState<SavedDoor[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'delete'>('success');
  const listRef = useRef<HTMLDivElement>(null);
  
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [selectionCount, setSelectionCount] = useState(1);
  const [showProjectInfoModal, setShowProjectInfoModal] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState('');
  
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    customerName: '',
    constructionLocation: '',
    constructionCompany: '',
    shippingCost: 0,
    defaultHeight: 220,
    defaultColor: 'ww',
    defaultHandle: 'satin-nickel',
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [confirmationData, setConfirmationData] = useState<{
      isOpen: boolean;
      messages: string[];
      targetType: 'presentation' | 'quotation' | null;
  }>({ isOpen: false, messages: [], targetType: null });
  
  const [checkedState, setCheckedState] = useState<boolean[]>([]);

  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playNotificationSound = useCallback((type: 'success' | 'delete' = 'success') => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
  
      const audioCtx = audioCtxRef.current;
      if (!audioCtx) return;
  
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
  
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
  
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
  
      const now = audioCtx.currentTime;

      if (type === 'success') {
        oscillator.type = 'sine';
        
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.05);
        oscillator.frequency.setValueAtTime(783.99, now + 0.10);
        oscillator.frequency.setValueAtTime(1046.50, now + 0.15);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gainNode.gain.setValueAtTime(0.1, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        
        oscillator.start(now);
        oscillator.stop(now + 1.2);
      } else {
        oscillator.type = 'sine';
        
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.08);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        oscillator.start(now);
        oscillator.stop(now + 0.08);
      }
    } catch (error) {
      console.error("Could not play notification sound:", error);
    }
  }, []);

  const handleProjectInfoComplete = (info: ProjectInfo) => {
    setProjectInfo(info);
    if (info.defaultHeight) updateConfig('height', info.defaultHeight);
    if (info.defaultColor) updateConfig('color', info.defaultColor);
    if (info.defaultHandle) updateConfig('handle', info.defaultHandle);
    
    setShowProjectInfoModal(false);
    setShowStartModal(true);
  };

  const handleProjectInfoSkip = () => {
    setShowProjectInfoModal(false);
    setShowStartModal(true);
  };

  const handleStartSelection = (roomName: string) => {
      setCurrentRoomName(roomName);
      if (roomName.includes('トイレ')) {
          updateConfig('lock', 'display-lock');
      }
      setShowStartModal(false);
  };

  const handleAddToList = () => {
    if (isEditing && editingId) {
      setSavedDoors(prevDoors => prevDoors.map(door => {
        if (door.id === editingId) {
          return {
            ...door,
            config: { ...config },
            price: totalPrice,
            roomName: currentRoomName,
          };
        }
        return door;
      }));

      setToastType('success');
      setToastMessage('修正を登録しました');
      setShowToast(true);
      playNotificationSound('success');
      setTimeout(() => setShowToast(false), 3000);
      
      setIsEditing(false);
      setEditingId(null);

      updateConfig('doorType', 'unselected');
      updateConfig('lock', 'none');
      updateConfig('glassStyle', 'none');
      updateConfig('color', projectInfo.defaultColor || 'ww');
      updateConfig('handle', projectInfo.defaultHandle || 'satin-nickel');
      updateConfig('height', projectInfo.defaultHeight || 220);
      setCurrentRoomName('');

    } else {
      const newDoor: SavedDoor = {
        id: `wd-${Date.now()}`,
        config: { ...config },
        price: totalPrice,
        roomName: currentRoomName,
      };
      setSavedDoors(prevDoors => [...prevDoors, newDoor]);

      setToastType('success');
      setToastMessage('リストに追加しました');
      setShowToast(true);
      playNotificationSound('success');
      setTimeout(() => setShowToast(false), 3000);

      updateConfig('lock', 'none');
      updateConfig('glassStyle', 'none');
      updateConfig('color', projectInfo.defaultColor || 'ww');
      updateConfig('handle', projectInfo.defaultHandle || 'satin-nickel');
      updateConfig('height', projectInfo.defaultHeight || 220);
      updateConfig('doorType', 'unselected');
      
      setSelectionCount(prev => prev + 1);
      setShowStartModal(true);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setToastMessage('修正をキャンセルしました');
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    updateConfig('doorType', 'unselected');
    setCurrentRoomName('');
  };

  const requestDeleteDoor = (id: string) => {
    setDeleteTargetId(id);
  };

  const executeDeleteDoor = () => {
    if (!deleteTargetId) return;
    setSavedDoors(prevDoors => prevDoors.filter(door => door.id !== deleteTargetId));
    setDeleteTargetId(null);
    setToastType('delete');
    setToastMessage('リストから削除しました');
    setShowToast(true);
    playNotificationSound('delete');
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handleEditDoor = (id: string) => {
    const doorToEdit = savedDoors.find(door => door.id === id);
    if (doorToEdit) {
        loadConfig(doorToEdit.config);
        setCurrentRoomName(doorToEdit.roomName || '');
        setIsEditing(true);
        setEditingId(id);
        setToastType('success');
        setToastMessage('修正モードになりました');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleUpdateDoor = (id: string, updates: Partial<SavedDoor>) => {
    setSavedDoors(prevDoors => prevDoors.map(door => 
      door.id === id ? { ...door, ...updates } : door
    ));
  };

  const handleAdminClick = () => {
    setPasswordInput('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '0000') {
      setIsPasswordModalOpen(false);
      setIsAdminModalOpen(true);
    } else {
      setPasswordError('暗証番号が違います。');
    }
  };
  
  const handleSaveFile = (asNew: boolean) => {
      setIsMenuOpen(false);
      let fileName = currentFileName;
      if (asNew || !fileName) {
          const defaultName = projectInfo.customerName ? `${projectInfo.customerName}様邸` : 'door_project';
          const input = window.prompt('ファイル名を入力してください', fileName || defaultName);
          if (!input) return;
          fileName = input.endsWith('.json') ? input : `${input}.json`;
      }

      const data = {
          version: '1.0',
          timestamp: Date.now(),
          doors: savedDoors,
          projectInfo: projectInfo
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName!;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCurrentFileName(fileName);
      setToastType('success');
      setToastMessage('ファイルを保存しました');
      setShowToast(true);
      playNotificationSound('success');
      setTimeout(() => setShowToast(false), 3000);
  };

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              if (Array.isArray(json.doors) && json.projectInfo) {
                  setSavedDoors(json.doors);
                  setProjectInfo(json.projectInfo);
                  setCurrentFileName(file.name);
                  updateConfig('doorType', 'unselected');
                  setCurrentRoomName('');
                  setIsEditing(false);
                  setEditingId(null);
                  setToastType('success');
                  setToastMessage('ファイルを読み込みました');
                  setShowToast(true);
                  playNotificationSound('success');
                  setTimeout(() => setShowToast(false), 3000);
              } else {
                  alert('無効なファイル形式です。正しいPITTAプロジェクトファイルを選択してください。');
              }
          } catch (err) {
              console.error(err);
              alert('ファイルの読み込みに失敗しました。');
          }
      };
      reader.readAsText(file);
      event.target.value = '';
      setIsMenuOpen(false);
  };

  const handleBatchDetailOutput = () => {
      setIsMenuOpen(false);
      if (savedDoors.length === 0) {
          alert("リストにドアがありません。");
          return;
      }
      generateBatchDetailDrawings({
          doors: savedDoors,
          doorTypes: appSettings.doorTypes,
          frameTypes: appSettings.frameTypes,
          colors: appSettings.colors,
          handles: appSettings.handles,
          glassStyles: appSettings.glassStyles,
          locks: appSettings.locks,
          dimensionSettings: appSettings.dimensionSettings,
          projectInfo: projectInfo
      });
  };

  const isCustomSize = (door: SavedDoor) => {
      const { config } = door;
      if (config.doorType.startsWith('material-')) return false;
      
      let presetWidths = [65, 70, 75, 80];
      if (config.doorType.startsWith('storage-')) presetWidths = [80, 120, 160, 200];
      else if (config.doorType === 'sliding-outset') presetWidths = [77.8, 77.81];
      else if (['sliding-inset', 'sliding-hikikomi'].includes(config.doorType)) presetWidths = [145, 164.5];
      else if (config.doorType === 'sliding-2') presetWidths = [145, 164.5];
      else if (config.doorType === 'sliding-kata-2') presetWidths = [243.1];
      else if (config.doorType === 'sliding-kata-3') presetWidths = [321.5];
      else if (config.doorType === 'sliding-3') presetWidths = [242];
      else if (config.doorType === 'sliding-4') presetWidths = [324.4];
      else if (config.doorType === 'hinged') presetWidths = [65, 73.5, 75.5, 77.8, 85];
      else if (config.doorType === 'hinged-storage') presetWidths = [43.5];
      else if (config.doorType === 'double') presetWidths = [73.5, 120];
      else if (config.doorType.startsWith('folding-')) {
        if (config.doorType === 'folding-2') presetWidths = [73.5];
        else if (config.doorType === 'folding-4') presetWidths = [120, 164.5];
        else if (config.doorType === 'folding-6') presetWidths = [245.1];
        else if (config.doorType === 'folding-8') presetWidths = [325.8];
      } else if (config.doorType.startsWith('sliding-')) presetWidths = [160, 180, 240, 320];

      let presetHeights = [200, 220, 240];
      if (config.doorType === 'hinged-storage' || config.doorType === 'double') {
          presetHeights = [90, 120, 200, 220, 240];
      }

      const isWidthCustom = !presetWidths.includes(config.width);
      const isHeightCustom = !config.doorType.startsWith('storage-') && !presetHeights.includes(config.height);

      return isWidthCustom || isHeightCustom;
  };

  const checkDoorDeviations = () => {
      const messages: string[] = [];
      let glassCount = 0;
      let lockCount = 0;
      const duplicatesMap = new Map<string, { count: number, name: string }>();

      const wdList = savedDoors.filter(d => !d.config.doorType.startsWith('storage-') && !d.config.doorType.startsWith('material-'));
      const sbList = savedDoors.filter(d => d.config.doorType.startsWith('storage-'));

      savedDoors.forEach(door => {
          const isMaterial = door.config.doorType.startsWith('material-');
          const isStorage = door.config.doorType.startsWith('storage-');
          const roomName = door.roomName || '名称未設定';
          
          let doorRef = '';
          if (isMaterial) {
              doorRef = `造作材（${roomName}）`;
          } else if (isStorage) {
              const idx = sbList.findIndex(d => d.id === door.id);
              doorRef = `SB${idx + 1}（${roomName}）`;
          } else {
              const idx = wdList.findIndex(d => d.id === door.id);
              doorRef = `WD${idx + 1}（${roomName}）`;
          }

          if (!isStorage && !isMaterial && door.config.color !== projectInfo.defaultColor) {
              const colorName = getOptionName(appSettings.colors, door.config.color);
              messages.push(`${doorRef} のドアが（${colorName}）で指定されています`);
          }

          const hasHandle = !['double', 'hinged-storage'].includes(door.config.doorType) 
                            && !door.config.doorType.startsWith('folding-') 
                            && !isStorage
                            && !isMaterial;
          
          if (hasHandle && door.config.handle !== projectInfo.defaultHandle) {
              const handleName = getOptionName(appSettings.handles, door.config.handle);
              messages.push(`${doorRef} のハンドルが（${handleName}）で指定されています`);
          }

          if (isCustomSize(door)) {
               messages.push(`${doorRef} のドアが特寸で指定されています`);
          }

          if (door.config.glassStyle !== 'none') glassCount++;
          if (door.config.lock === 'display-lock') lockCount++;

          const canHaveLock = ['hinged', 'sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(door.config.doorType);
          if (canHaveLock && (roomName.includes('洗面') || roomName.includes('脱衣') || roomName.includes('トイレ'))) {
              if (door.config.lock !== 'display-lock') {
                  messages.push(`【${doorRef} に表示錠が選択されていません】`);
              }
          }

          if (!isStorage && !isMaterial) {
              if (door.config.height < 220 && door.config.frameType !== 'threeWay') {
                  messages.push(`${doorRef} のドア（H${door.config.height}）が3方枠ではありません`);
              }
          }

          if (isStorage || isMaterial) {
              const signature = JSON.stringify({
                  type: door.config.doorType,
                  w: door.config.width,
                  h: door.config.height,
                  c: door.config.color,
              });
              
              if (!duplicatesMap.has(signature)) {
                  const typeName = getOptionName(appSettings.doorTypes, door.config.doorType);
                  duplicatesMap.set(signature, { count: 1, name: typeName });
              } else {
                  const entry = duplicatesMap.get(signature)!;
                  entry.count++;
              }
          }
      });

      if (glassCount > 0) messages.push(`【ガラスドアが（${glassCount}）か所指定されています】`);
      if (lockCount > 0) messages.push(`【表示錠が（${lockCount}）か所指定されています】`);
      
      duplicatesMap.forEach((value) => {
          if (value.count > 1) {
              messages.push(`【重複確認】${value.name} がリストに ${value.count} 件含まれています`);
          }
      });

      return messages;
  };

  const handlePreGenerate = (type: 'presentation' | 'quotation') => {
      setIsMenuOpen(false);
      const messages = checkDoorDeviations();
      if (messages.length > 0) {
          setConfirmationData({ isOpen: true, messages, targetType: type });
          setCheckedState(new Array(messages.length).fill(false));
      } else {
          const settings = { 
            doorTypes: appSettings.doorTypes, 
            frameTypes: appSettings.frameTypes, 
            colors: appSettings.colors, 
            handles: appSettings.handles, 
            glassStyles: appSettings.glassStyles, 
            locks: appSettings.locks,
            matrixPrices: appSettings.matrixPrices,
          };
          const wdDoors = savedDoors.filter(d => !d.config.doorType.startsWith('storage-') && !d.config.doorType.startsWith('material-'));
          const sbDoors = savedDoors.filter(d => d.config.doorType.startsWith('storage-'));
          const mtDoors = savedDoors.filter(d => d.config.doorType.startsWith('material-'));
          const sortedDoors = [...wdDoors, ...sbDoors, ...mtDoors];
          
          generateDocument(type, sortedDoors, settings, projectInfo);
      }
  };

  const handleCheckToggle = (index: number) => {
      setCheckedState(prev => {
          const newState = [...prev];
          newState[index] = !newState[index];
          return newState;
      });
  };

  const isAllChecked = checkedState.length > 0 && checkedState.every(Boolean);

  const handleConfirmGeneration = () => {
      if (confirmationData.targetType) {
          const settings = { 
            doorTypes: appSettings.doorTypes, 
            frameTypes: appSettings.frameTypes, 
            colors: appSettings.colors, 
            handles: appSettings.handles, 
            glassStyles: appSettings.glassStyles, 
            locks: appSettings.locks,
            matrixPrices: appSettings.matrixPrices,
          };
          const wdDoors = savedDoors.filter(d => !d.config.doorType.startsWith('storage-') && !d.config.doorType.startsWith('material-'));
          const sbDoors = savedDoors.filter(d => d.config.doorType.startsWith('storage-'));
          const mtDoors = savedDoors.filter(d => d.config.doorType.startsWith('material-'));
          const sortedDoors = [...wdDoors, ...sbDoors, ...mtDoors];
          
          generateDocument(confirmationData.targetType, sortedDoors, settings, projectInfo);
      }
      setConfirmationData({ isOpen: false, messages: [], targetType: null });
  };

  const getDeleteTargetName = () => {
    if (!deleteTargetId) return '';
    const door = savedDoors.find(d => d.id === deleteTargetId);
    if (!door) return '';

    const isStorage = door.config.doorType.startsWith('storage-');
    const isMaterial = door.config.doorType.startsWith('material-');
    const roomName = door.roomName || '名称未設定';
    
    const wdList = savedDoors.filter(d => !d.config.doorType.startsWith('storage-') && !d.config.doorType.startsWith('material-'));
    const sbList = savedDoors.filter(d => d.config.doorType.startsWith('storage-'));

    let prefix = '';
    let index = 0;

    if (isMaterial) {
        prefix = '造作材';
    } else if (isStorage) {
        index = sbList.findIndex(d => d.id === door.id) + 1;
        prefix = `SB${index}`;
    } else {
        index = wdList.findIndex(d => d.id === door.id) + 1;
        prefix = `WD${index}`;
    }

    return `${prefix}（${roomName}）`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md relative z-30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative mr-4">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none relative z-50"
                  aria-label="メニュー"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                            <button 
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setShowProjectInfoModal(true);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                プロジェクト情報
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                                onClick={() => handlePreGenerate('presentation')}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                プレゼンボード出力
                            </button>
                            <button 
                                onClick={handleBatchDetailOutput}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                詳細図一括出力
                            </button>
                            <button 
                                onClick={() => handlePreGenerate('quotation')}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 36v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                見積り書出力
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                </svg>
                                ファイルを開く
                            </button>
                            <button 
                                onClick={() => handleSaveFile(false)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                上書き保存
                            </button>
                            <button 
                                onClick={() => handleSaveFile(true)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                名前を付けて保存
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-baseline gap-3">
                <h1 className="text-3xl font-bold text-gray-800">
                PITTA
                </h1>
                <span className="text-lg font-bold text-gray-500">Build Your Door</span>
                {projectInfo.customerName && (
                    <span className="text-lg font-medium text-gray-600 ml-2 border-l border-gray-300 pl-3">
                        {projectInfo.customerName} 様邸
                    </span>
                )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
                onClick={handleAdminClick}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="管理者設定を開く"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
          </div>
        </div>
      </header>

      {confirmationData.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-out" style={{ animationDuration: '0.2s', animationName: 'none' }}>
                  <div className="bg-black p-4 text-white flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h3 className="text-lg font-bold">確認</h3>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4">以下の内容で仕様が変更されています。<br/>よろしいですか？</p>
                      <ul className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {confirmationData.messages.map((msg, idx) => (
                              <li 
                                key={idx} 
                                className="text-sm font-medium text-gray-800 flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => handleCheckToggle(idx)}
                              >
                                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checkedState[idx] ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                      {checkedState[idx] && (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                      )}
                                  </div>
                                  <span>{msg}</span>
                              </li>
                          ))}
                      </ul>
                      <div className="flex justify-end gap-3">
                          <button 
                              onClick={() => setConfirmationData({ ...confirmationData, isOpen: false })}
                              className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                          >
                              キャンセル
                          </button>
                          <button 
                              onClick={handleConfirmGeneration}
                              disabled={!isAllChecked}
                              className={`px-5 py-2.5 rounded-lg font-bold shadow-lg transition-colors ${isAllChecked ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                              OK
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <DeleteConfirmationModal 
        isOpen={!!deleteTargetId}
        doorName={getDeleteTargetName()}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDeleteDoor}
      />

      <main className="flex flex-col-reverse lg:flex-row w-full lg:h-[calc(100vh-80px)]">
        <div className="flex-grow flex flex-col lg:overflow-hidden">
          <div className="h-[35vh] lg:h-[55%] flex-shrink-0">
            <DoorPreview 
              config={config} 
              colors={appSettings.colors}
              doorTypes={appSettings.doorTypes}
              frameTypes={appSettings.frameTypes}
              glassStyles={appSettings.glassStyles}
            />
          </div>
          <div className="flex-grow overflow-y-auto px-4 lg:px-8 pb-4 lg:pb-8" ref={listRef}>
            <DoorList
              doors={savedDoors}
              onDelete={requestDeleteDoor}
              onEdit={handleEditDoor}
              onUpdate={handleUpdateDoor}
              editingId={editingId}
              doorTypes={appSettings.doorTypes}
              frameTypes={appSettings.frameTypes}
              colors={appSettings.colors}
              handles={appSettings.handles}
              glassStyles={appSettings.glassStyles}
              locks={appSettings.locks}
              matrixPrices={appSettings.matrixPrices}
              notificationMessage={showToast ? toastMessage : null}
              notificationType={showToast ? toastType : undefined}
              projectInfo={projectInfo}
              dimensionSettings={appSettings.dimensionSettings}
            />
          </div>
        </div>
        
        <CustomizationPanel 
          config={config} 
          updateConfig={updateConfig} 
          totalPrice={totalPrice}
          onAddToList={handleAddToList}
          isEditing={isEditing}
          onCancelEdit={handleCancelEdit}
          doorTypes={appSettings.doorTypes}
          frameTypes={appSettings.frameTypes}
          colors={appSettings.colors}
          handles={appSettings.handles}
          glassStyles={appSettings.glassStyles}
          locks={appSettings.locks}
        />
      </main>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileLoad}
      />

      <ProjectInfoModal
        isOpen={showProjectInfoModal}
        initialInfo={projectInfo}
        onComplete={handleProjectInfoComplete}
        onSkip={handleProjectInfoSkip}
        shippingRates={appSettings.shippingRates}
        colors={appSettings.colors}
        handles={appSettings.handles}
      />

      <StartSelectionModal
        isOpen={showStartModal}
        count={selectionCount}
        onStart={handleStartSelection}
      />

      {isPasswordModalOpen && (
        <PasswordModal
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onSubmit={handlePasswordSubmit}
          onClose={() => setIsPasswordModalOpen(false)}
          error={passwordError}
        />
      )}

      {isAdminModalOpen && (
        <AdminPanel
          settings={appSettings}
          onUpdateSettings={setAppSettings}
          onClose={() => setIsAdminModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
