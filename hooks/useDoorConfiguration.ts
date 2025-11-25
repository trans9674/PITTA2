import { useState, useMemo, useCallback } from 'react';
import { DoorConfiguration, DoorOption, ColorOption, DoorTypeId, FrameTypeId, HandleId, GlassStyleId, LockId, MatrixPrices, MatrixPriceEntry } from '../types';
import { INITIAL_CONFIG } from '../constants';
import { buildMatrixKey } from '../utils';

interface AppSettings {
  basePrice: number;
  pricePerSqCm: number;
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
  glassStyles: DoorOption<GlassStyleId>[];
  locks: DoorOption<LockId>[];
  shippingRates: Record<string, number>;
  matrixPrices: MatrixPrices;
}

const getPriceForHeight = (option: { price: number; priceH2200: number; priceH2400: number; priceH90?: number; priceH120?: number } | undefined, height: number): number => {
  if (!option) return 0;
  if (option.priceH90 !== undefined && height <= 90) return option.priceH90;
  if (option.priceH120 !== undefined && height <= 120) return option.priceH120;
  if (height <= 200) {
    return option.price;
  }
  if (height <= 220) {
    return option.priceH2200;
  }
  return option.priceH2400;
};

export const useDoorConfiguration = (settings: AppSettings) => {
  const [config, setConfig] = useState<DoorConfiguration>(INITIAL_CONFIG);

  const loadConfig = useCallback((newConfig: DoorConfiguration) => {
      setConfig(newConfig);
  }, []);

  const updateConfig = useCallback(<K extends keyof DoorConfiguration>(key: K, value: DoorConfiguration[K]) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      
      if (key === 'width') {
          const w = value as number;
          if (w === 80 && (prev.doorType === 'storage-200-l' || prev.doorType === 'storage-200-u')) {
              newConfig.doorType = 'storage-80'; 
              newConfig.height = 90; 
          }
          if (w === 200 && prev.doorType === 'storage-200-full') {
            alert('サイズがありませんので他のサイズを選んでください');
            newConfig.width = 160;
          }
      }

      if (key === 'doorType') {
        const newDoorType = value as DoorTypeId;
        const oldDoorType = prev.doorType;

        const wasStorageType = oldDoorType.startsWith('storage-');
        const isNowStorageType = newDoorType.startsWith('storage-');
        const isMaterialType = newDoorType.startsWith('material-');
        const isHingedStorage = newDoorType === 'hinged-storage';

        const canHaveGlass = ['hinged', 'sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(newDoorType);
        const isMultiPanelSliding = ['sliding-2', 'sliding-3', 'sliding-kata-2', 'sliding-kata-3', 'sliding-4'].includes(newDoorType);
        const isNewFoldingType = newDoorType.startsWith('folding-');
        const isDouble = newDoorType === 'double';
        const canHaveLock = ['hinged', 'sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(newDoorType);
        
        if (isMultiPanelSliding || isNewFoldingType || isDouble || isHingedStorage) {
            newConfig.frameType = 'threeWay';
        }
        
        const normalWidths: Record<string, number> = {
            'hinged': 77.8,
            'sliding-inset': 164.5,
            'sliding-outset': 77.8,
            'sliding-hikikomi': 164.5,
            'sliding-2': 164.5,
            'sliding-3': 242,
            'sliding-kata-2': 243.1,
            'sliding-kata-3': 321.5,
            'sliding-4': 324.4,
            'folding-2': 73.5,
            'folding-4': 164.5,
            'folding-6': 245.1,
            'folding-8': 325.8,
            'double': 73.5,
            'hinged-storage': 43.5,
        };

        if (normalWidths[newDoorType]) {
            newConfig.width = normalWidths[newDoorType];
        } else if (isNowStorageType) {
             if (!wasStorageType) {
                 newConfig.width = 160; 
             }
        }

        if (!canHaveGlass || isMultiPanelSliding || isNewFoldingType || isNowStorageType || isMaterialType || isHingedStorage) {
          newConfig.glassStyle = 'none';
        }
        
        if (isMultiPanelSliding || isNewFoldingType || isNowStorageType || isMaterialType || isHingedStorage || isDouble) {
            newConfig.handle = 'satin-nickel';
        }

        if (!canHaveLock) {
            newConfig.lock = 'none';
        }
        
        if (isMaterialType) {
            newConfig.count = 1;
            newConfig.color = 'ww';
        }

        if (wasStorageType && !isNowStorageType) {
            newConfig.height = 220;
        } else if (isNowStorageType) {
            if (newDoorType === 'storage-80') {
                newConfig.height = 90;
            } else {
                newConfig.height = 200;
            }

            if (newDoorType === 'storage-200-l' || newDoorType === 'storage-200-u') {
                newConfig.hingeSide = 'left';
            }
        }
      }

      if (key === 'height') {
          const h = value as number;
          if (h === 200) {
              newConfig.frameType = 'threeWay';
          }
          if (newConfig.doorType === 'double' && (h === 90 || h === 120)) {
              newConfig.frameType = 'threeWay';
          }
      }

      return newConfig;
    });
  }, []);

  const totalPrice = useMemo(() => {
    // 1. Check for price in the new pricing matrix
    const matrixKey = buildMatrixKey(config);
    const matrixPriceEntry = settings.matrixPrices?.[matrixKey];
    
    if (matrixPriceEntry) {
        let heightKey: keyof MatrixPriceEntry;
        if (config.height <= 90) heightKey = 'h90';
        else if (config.height <= 120) heightKey = 'h120';
        else if (config.height <= 200) heightKey = 'h2000';
        else if (config.height <= 220) heightKey = 'h2200';
        else heightKey = 'h2400';
        
        const matrixPrice = matrixPriceEntry[heightKey];
        if (typeof matrixPrice === 'number' && matrixPrice > 0) {
            // Price from matrix is found. This is the base price for the door + frame + lock combo.
            const doorTypePrice = matrixPrice;
            const colorPrice = getPriceForHeight(settings.colors.find(c => c.id === config.color), config.height);
            const handlePrice = getPriceForHeight(settings.handles.find(h => h.id === config.handle), config.height);
            const glassPrice = getPriceForHeight(settings.glassStyles.find(g => g.id === config.glassStyle), config.height);
            const sizePrice = config.width * config.height * settings.pricePerSqCm;
            
            // Frame and Lock prices are included in the matrix, so they are 0 here.
            return settings.basePrice + doorTypePrice + colorPrice + handlePrice + glassPrice + sizePrice;
        }
    }

    // 2. Fallback to the original pricing logic if no matrix price is found
    let doorTypePriceOption;
    for (const type of settings.doorTypes) {
        if (type.id === config.doorType) {
            doorTypePriceOption = type;
            break;
        }
        if (type.subOptions) {
            const subOption = type.subOptions.find(sub => sub.id === config.doorType);
            if (subOption) {
                doorTypePriceOption = subOption;
                break;
            }
        }
    }

    let doorTypePrice = 0;
    
    if (config.doorType.startsWith('storage-') && doorTypePriceOption) {
        const isRType = ['storage-200-l', 'storage-200-u'].includes(config.doorType) && config.hingeSide === 'right';

        if (config.width === 80) {
            const priceR = isRType ? doorTypePriceOption.priceW80_R : undefined;
            doorTypePrice = (priceR !== undefined && priceR > 0) ? priceR : (doorTypePriceOption.priceW80 ?? doorTypePriceOption.price);
        } else if (config.width === 120) {
            const priceR = isRType ? doorTypePriceOption.priceW120_R : undefined;
            doorTypePrice = (priceR !== undefined && priceR > 0) ? priceR : (doorTypePriceOption.priceW120 ?? 0);
        } else if (config.width === 160) {
            const priceR = isRType ? doorTypePriceOption.priceW160_R : undefined;
            doorTypePrice = (priceR !== undefined && priceR > 0) ? priceR : (doorTypePriceOption.priceW160 ?? 0);
        } else if (config.width === 200) {
            const priceR = isRType ? doorTypePriceOption.priceW200_R : undefined;
            doorTypePrice = (priceR !== undefined && priceR > 0) ? priceR : (doorTypePriceOption.priceW200 ?? 0);
        } else {
             doorTypePrice = doorTypePriceOption.price;
        }
    } else if (config.doorType.startsWith('material-') && doorTypePriceOption) {
        doorTypePrice = doorTypePriceOption.price * (config.count || 1);
    } else {
        doorTypePrice = getPriceForHeight(doorTypePriceOption, config.height);
    }

    const isStorageType = config.doorType.startsWith('storage-');
    const isMaterialType = config.doorType.startsWith('material-');
    
    if (isMaterialType) {
        return settings.basePrice + doorTypePrice;
    }

    const frameTypePrice = isStorageType ? 0 : getPriceForHeight(settings.frameTypes.find(f => f.id === config.frameType), config.height);
    const colorPrice = getPriceForHeight(settings.colors.find(c => c.id === config.color), config.height);
    const handlePrice = getPriceForHeight(settings.handles.find(h => h.id === config.handle), config.height);
    const glassPrice = getPriceForHeight(settings.glassStyles.find(g => g.id === config.glassStyle), config.height);
    const lockPrice = getPriceForHeight(settings.locks.find(l => l.id === config.lock), config.height);
    
    const sizePrice = config.width * config.height * settings.pricePerSqCm;
    
    return settings.basePrice + doorTypePrice + frameTypePrice + colorPrice + handlePrice + glassPrice + lockPrice + sizePrice;
  }, [config, settings]);

  return { config, updateConfig, loadConfig, totalPrice };
};
