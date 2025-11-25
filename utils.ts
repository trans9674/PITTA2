import { DoorConfiguration, DoorOption } from './types';

export const getOptionName = <T extends string>(options: DoorOption<T>[], id: T): string => {
  for (const option of options) {
    if (option.id === id) {
      return option.name;
    }
    if (option.subOptions) {
      const subOption = option.subOptions.find(sub => sub.id === id);
      if (subOption) {
        return subOption.name;
      }
    }
  }
  return '不明';
};

export const buildMatrixKey = (config: DoorConfiguration): string => {
    const { doorType, frameType, lock, width, hingeSide } = config;

    if (doorType.startsWith('storage-') || doorType.startsWith('material-')) {
        return '';
    }
    
    const isFixed3Way = ['sliding-2', 'sliding-3', 'sliding-4', 'sliding-kata-2', 'sliding-kata-3', 'double', 'folding-2', 'folding-4', 'folding-6', 'folding-8', 'hinged-storage', 'sliding-hikikomi'].includes(doorType);
    const frameKey = isFixed3Way ? '3w' : (frameType === 'twoWay' ? '2w' : '3w');

    const isLock = lock === 'display-lock';

    switch(doorType) {
        case 'hinged':
            return `hinged_${frameKey}_${isLock ? 'l' : 'nl'}`;
        
        case 'sliding-inset':
            return `sliding-inset_${frameKey}_${isLock ? 'l' : 'nl'}`;

        case 'sliding-outset':
            const isCorner = width > 77.8;
            if (isCorner) {
                return `sliding-outset_${frameKey}_c${isLock ? 'l' : ''}`;
            }
            return `sliding-outset_${frameKey}_${isLock ? 'l' : 'nl'}`;

        case 'sliding-hikikomi':
            return `sliding-hikikomi_3w_nl`;

        case 'sliding-2':
        case 'sliding-3':
        case 'sliding-4':
            return `${doorType}_3w_nl`;

        case 'sliding-kata-2':
        case 'sliding-kata-3':
             const sideKey = hingeSide === 'left' ? 'L' : 'R';
             return `${doorType}_${sideKey}`;
        
        case 'double':
            if (width === 73.5) return 'double_w73.5';
            if (width === 120) return 'double_w120';
            return '';

        case 'folding-2':
        case 'folding-4':
        case 'folding-6':
        case 'folding-8':
            return `${doorType}_3w_nl`;
            
        case 'hinged-storage':
            return `hinged-storage_3w_nl`;

        default:
            return '';
    }
};
