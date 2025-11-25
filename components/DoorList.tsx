
import React, { useState } from 'react';
import { SavedDoor, DoorOption, DoorTypeId, HandleId, ColorOption, FrameTypeId, GlassStyleId, LockId, ProjectInfo, DimensionSettings, MatrixPrices } from '../types';
import PrintDoorPreview from './PrintDoorPreview';
import { getOptionName } from '../utils';
import DoorDetailModal from './DoorDetailModal';

interface DoorListItemProps {
  door: SavedDoor;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
  onUpdate: (id: string, updates: Partial<SavedDoor>) => void;
  onViewDetail: () => void;
  isEditing?: boolean;
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
  glassStyles: DoorOption<GlassStyleId>[];
  locks: DoorOption<LockId>[];
}

const DoorListItem: React.FC<DoorListItemProps> = ({ door, index, onDelete, onEdit, onUpdate, onViewDetail, isEditing, doorTypes, frameTypes, colors, handles, glassStyles, locks }) => {
  const { config, price, roomName } = door;
  const showHingeSide = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(config.doorType);
  const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
  const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(config.doorType);
  const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(config.doorType);
  
  const isNewSlidingType = config.doorType.startsWith('sliding-');
  const isNewFoldingType = config.doorType.startsWith('folding-');
  const isStorage = config.doorType.startsWith('storage-');
  const isMaterial = config.doorType.startsWith('material-');
  const isCornerSkirting = config.doorType === 'material-corner-skirting';
  
  let idPrefix = 'WD';
  if (isStorage) idPrefix = 'SB';
  if (isMaterial) idPrefix = '造作材';

  let hingeSideText = null;
  if (showHingeSide) {
      if (isPocketSliding) {
          hingeSideText = config.hingeSide === 'right' ? '右戸袋' : '左戸袋';
      } else if (isKataSliding) {
          hingeSideText = config.hingeSide === 'right' ? '右勝手' : '左勝手';
      } else if (isStorageLR) {
          hingeSideText = config.hingeSide === 'right' ? 'Rタイプ' : 'Lタイプ';
      } else {
          hingeSideText = config.hingeSide === 'right' ? '左吊元' : '右吊元';
      }
  }

  const doorTypeDetails = [
    getOptionName(doorTypes, config.doorType),
    hingeSideText,
    !isStorage && !isMaterial ? getOptionName(frameTypes, config.frameType) : null
  ].filter(Boolean).join('　');

  const presetWidthsForNewSliding = [160, 180, 240, 320];
  const presetWidthsDefault = [65, 70, 75, 80];
  const presetWidthsHinged = [65, 73.5, 75.5, 77.8, 85];
  
  let currentPresetWidths = presetWidthsDefault;
  if (isStorage) {
    currentPresetWidths = [80, 120, 160, 200];
  } else if (config.doorType === 'sliding-outset') {
    currentPresetWidths = [77.8, 77.81];
  } else if (['sliding-inset', 'sliding-hikikomi'].includes(config.doorType)) {
    currentPresetWidths = [145, 164.5];
  } else if (isNewFoldingType) {
    switch(config.doorType) {
      case 'folding-2': currentPresetWidths = [73.5]; break;
      case 'folding-4': currentPresetWidths = [120, 164.5]; break;
      case 'folding-6': currentPresetWidths = [245.1]; break;
      case 'folding-8': currentPresetWidths = [325.8]; break;
      default: currentPresetWidths = [75, 80, 85];
    }
  } else if (config.doorType === 'sliding-2') {
    currentPresetWidths = [145, 164.5];
  } else if (config.doorType === 'sliding-kata-2') {
    currentPresetWidths = [243.1];
  } else if (config.doorType === 'sliding-kata-3') {
    currentPresetWidths = [321.5];
  } else if (config.doorType === 'sliding-3') {
    currentPresetWidths = [242];
  } else if (config.doorType === 'sliding-4') {
    currentPresetWidths = [324.4];
  } else if (isNewSlidingType) {
    currentPresetWidths = presetWidthsForNewSliding;
  } else if (config.doorType === 'hinged') {
    currentPresetWidths = presetWidthsHinged;
  } else if (config.doorType === 'hinged-storage') {
    currentPresetWidths = [43.5];
  } else if (config.doorType === 'double') {
    currentPresetWidths = [73.5, 120];
  }

  const presetHeights = [200, 220, 240];
  const presetHeightsStorage = [90, 120, 200, 220, 240];
  const presetHeightsDouble = [90, 120, 200, 220, 240];
  
  let validHeights = presetHeights;
  if (config.doorType === 'hinged-storage') validHeights = presetHeightsStorage;
  else if (config.doorType === 'double') validHeights = presetHeightsDouble;

  const isCustomHeight = !isStorage && !isMaterial && !validHeights.includes(config.height);
  const isCustomWidth = !isMaterial && !currentPresetWidths.includes(config.width);
  const isCustomSize = isCustomWidth || isCustomHeight;

  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [tempRoomName, setTempRoomName] = useState(roomName || '');

  const handleRoomNameSave = () => {
    onUpdate(door.id, { roomName: tempRoomName });
    setIsEditingRoomName(false);
  };

  const handleRoomNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRoomNameSave();
    }
  };

  const getPreviewWidthClass = () => {
    if ((config.doorType === 'double' && config.width === 120) || ['sliding-3', 'sliding-kata-3', 'folding-6'].includes(config.doorType)) {
      return 'w-24';
    }
    if (['sliding-4', 'folding-8'].includes(config.doorType)) {
      return 'w-[115px]';
    }
    return 'w-16';
  };

  return (
    <div className={`relative bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start group h-full ${isEditing ? 'ring-2 ring-black ring-offset-2' : ''}`}>
      {isEditing && (
          <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px] cursor-not-allowed">
              <div className="bg-black text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>編集中</span>
              </div>
          </div>
      )}

      <button
        onClick={onViewDetail}
        className="absolute top-2 left-2 text-gray-400 hover:text-black transition-all duration-200 p-1.5 rounded-full z-30 bg-white/50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm"
        aria-label="詳細を表示"
        title="詳細を表示"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full z-30 bg-white/80 hover:bg-white"
        aria-label={`${idPrefix}${!isMaterial ? index + 1 : ''}を削除`}
        disabled={isEditing}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button
        onClick={onEdit}
        className="absolute bottom-2 right-2 bg-black text-white hover:bg-gray-800 transition-colors duration-200 p-1 rounded-full z-30 shadow-md flex items-center justify-center"
        aria-label="修正"
        title="修正（リストから削除して再編集）"
        disabled={isEditing}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <div className="flex-1 min-w-0 pr-2 pl-6">
        <div className="font-bold text-gray-800 text-lg flex flex-wrap items-center gap-2 mb-1">
            <span>{isMaterial ? '造作材' : `${idPrefix}${index + 1}`}</span>
            {!isMaterial && (
                isEditingRoomName ? (
                  <input
                    type="text"
                    value={tempRoomName}
                    onChange={(e) => setTempRoomName(e.target.value)}
                    onBlur={handleRoomNameSave}
                    onKeyDown={handleRoomNameKeyDown}
                    autoFocus
                    placeholder="部屋名"
                    className="px-2 py-0.5 text-sm font-normal border border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 w-32"
                  />
                ) : (
                  <span 
                    onClick={() => setIsEditingRoomName(true)}
                    className={`text-sm font-normal px-2 py-0.5 rounded cursor-pointer transition-colors border border-transparent hover:border-gray-300 hover:bg-gray-50 truncate max-w-[140px] ${roomName ? 'text-gray-600 bg-gray-100' : 'text-gray-400 border-dashed border-gray-300'}`}
                    title={roomName || "部屋名を編集"}
                  >
                    {roomName || '+ 部屋名'}
                  </span>
                )
            )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-2 pr-6">{doorTypeDetails}</p>
        
        <div className="text-sm space-y-0.5 text-gray-700">
            {isMaterial ? (
                <p className="font-bold">数量: {config.count || 1}{isCornerSkirting ? '個' : '本'}</p>
            ) : (
                <p className={`${isCustomSize ? 'text-red-600 font-bold' : ''}`}>W{config.width.toFixed(1)} × H{config.height}</p>
            )}
            <p className="truncate">色: {getOptionName(colors, config.color)}</p>
            
            {!isNewFoldingType && !isStorage && !isMaterial && config.doorType !== 'double' && config.doorType !== 'hinged-storage' && (
                <p className="truncate">取手: {getOptionName(handles, config.handle)}</p>
            )}
            {config.lock && config.lock !== 'none' && locks && (
              <p className={config.lock === 'display-lock' ? 'font-bold text-red-600' : ''}>
                {config.lock === 'display-lock' ? '表示錠あり' : getOptionName(locks, config.lock)}
              </p>
            )}
            {config.glassStyle !== 'none' && (
              <p className="font-bold text-red-600">{getOptionName(glassStyles, config.glassStyle)}</p>
            )}
        </div>
        
        <p className="text-lg font-bold text-black mt-3">¥{price.toLocaleString()}</p>
      </div>
      
      {!isMaterial && (
        <div className={`${getPreviewWidthClass()} h-24 flex-shrink-0 mt-1`}>
            <PrintDoorPreview config={config} colors={colors}/>
        </div>
      )}
    </div>
  );
};

interface DoorListProps {
  doors: SavedDoor[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SavedDoor>) => void;
  editingId: string | null;
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
  glassStyles: DoorOption<GlassStyleId>[];
  locks: DoorOption<LockId>[];
  matrixPrices: MatrixPrices;
  notificationMessage?: string | null;
  notificationType?: 'success' | 'delete';
  projectInfo: ProjectInfo;
  dimensionSettings: DimensionSettings;
}

const DoorList: React.FC<DoorListProps> = ({
  doors,
  onDelete,
  onEdit,
  onUpdate,
  editingId,
  doorTypes,
  frameTypes,
  colors,
  handles,
  glassStyles,
  locks,
  matrixPrices,
  notificationMessage,
  notificationType,
  projectInfo,
  dimensionSettings
}) => {
    const totalListPrice = doors.reduce((sum, door) => sum + door.price, 0);
    const [detailDoor, setDetailDoor] = useState<{ door: SavedDoor, index: number } | null>(null);

    const wdList = doors.filter(d => !d.config.doorType.startsWith('storage-') && !d.config.doorType.startsWith('material-'));
    const sbList = doors.filter(d => d.config.doorType.startsWith('storage-'));

    const getDoorIndex = (door: SavedDoor) => {
        if (door.config.doorType.startsWith('storage-')) {
            return sbList.findIndex(d => d.id === door.id);
        } else if (door.config.doorType.startsWith('material-')) {
            return -1;
        }
        return wdList.findIndex(d => d.id === door.id);
    };

    return (
        <div className="pb-20 lg:pb-0">
             <div className="flex justify-between items-end mb-4 border-b-2 border-gray-200 pb-2">
                <h2 className="text-xl font-bold text-gray-800">ドアリスト</h2>
                <div className="text-right">
                    <span className="text-xs text-gray-500 mr-2 font-bold">合計金額</span>
                    <span className="text-2xl font-bold text-black">¥{totalListPrice.toLocaleString()}</span>
                </div>
            </div>

            {notificationMessage && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 transition-all duration-300 animate-fade-in-down ${notificationType === 'delete' ? 'bg-gray-800 text-white' : 'bg-black text-white'}`}>
                     {notificationType === 'delete' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
                        </svg>
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                     )}
                     <span>{notificationMessage}</span>
                </div>
            )}

            {doors.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>ドアがリストにありません。</p>
                    <p className="text-sm">右のパネルからドアを作成し、「リストに追加」してください。</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 pt-4">
                    {doors.map((door) => (
                        <DoorListItem
                            key={door.id}
                            door={door}
                            index={getDoorIndex(door)}
                            onDelete={() => onDelete(door.id)}
                            onEdit={() => onEdit(door.id)}
                            onUpdate={onUpdate}
                            onViewDetail={() => setDetailDoor({ door, index: getDoorIndex(door) })}
                            isEditing={editingId === door.id}
                            doorTypes={doorTypes}
                            frameTypes={frameTypes}
                            colors={colors}
                            handles={handles}
                            glassStyles={glassStyles}
                            locks={locks}
                        />
                    ))}
                </div>
            )}
            
            {detailDoor && (
                <DoorDetailModal
                    door={detailDoor.door}
                    doorIndex={detailDoor.index}
                    onClose={() => setDetailDoor(null)}
                    doorTypes={doorTypes}
                    frameTypes={frameTypes}
                    colors={colors}
                    handles={handles}
                    glassStyles={glassStyles}
                    locks={locks}
                    dimensionSettings={dimensionSettings}
                    projectInfo={projectInfo}
                    matrixPrices={matrixPrices}
                />
            )}
        </div>
    );
};

export default DoorList;
