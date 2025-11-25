import React, { useState, Fragment, useEffect } from 'react';
import { DoorOption, ColorOption, DoorTypeId, HandleId, GlassStyleId, ColorId, FrameTypeId, LockId, DimensionSettings, DimensionConfig, MatrixPrices, MatrixPriceEntry } from '../types';
import { PREFECTURES, DIMENSION_ROWS, DEFAULT_MATRIX_PRICES } from '../constants';
import { MATRIX_ROWS } from './AdminMatrixDefinition';

interface AdminPanelProps {
  settings: {
    basePrice: number;
    pricePerSqCm: number;
    doorTypes: DoorOption<DoorTypeId>[];
    frameTypes: DoorOption<FrameTypeId>[];
    colors: ColorOption[];
    handles: DoorOption<HandleId>[];
    glassStyles: DoorOption<GlassStyleId>[];
    locks: DoorOption<LockId>[];
    shippingRates: Record<string, number>;
    dimensionSettings: DimensionSettings;
    matrixPrices: MatrixPrices;
  };
  onUpdateSettings: (newSettings: AdminPanelProps['settings']) => void;
  onClose: () => void;
}

// Helper to find the longest common starting path from a list of URLs
const findCommonPrefix = (strs: string[]): string => {
    if (!strs || strs.length === 0) return '';
    const validStrs = strs.filter(Boolean);
    if (validStrs.length === 0) return '';

    const firstStr = validStrs[0];
    for (let i = 0; i < firstStr.length; i++) {
        const char = firstStr[i];
        for (let j = 1; j < validStrs.length; j++) {
            if (i >= validStrs[j].length || validStrs[j][i] !== char) {
                const prefix = firstStr.substring(0, i);
                const lastSlash = prefix.lastIndexOf('/');
                return lastSlash !== -1 ? prefix.substring(0, lastSlash + 1) : '';
            }
        }
    }
    const lastSlash = firstStr.lastIndexOf('/');
    return lastSlash !== -1 ? firstStr.substring(0, lastSlash + 1) : firstStr;
};


const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdateSettings, onClose }) => {
  const [localSettings, setLocalSettings] = useState({ ...settings, matrixPrices: settings.matrixPrices || DEFAULT_MATRIX_PRICES });
  const [commonUrl, setCommonUrl] = useState('');
  const [exportJson, setExportJson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doorPrices' | 'shipping' | 'dimensions'>('doorPrices');
  
  const urlKeys = ['detailDrawingUrl', 'detailDrawingUrl_R', 'detailDrawingUrlW80', 'detailDrawingUrlW120', 'detailDrawingUrlW160', 'detailDrawingUrlW200', 'detailDrawingUrlW80_R', 'detailDrawingUrlW120_R', 'detailDrawingUrlW160_R', 'detailDrawingUrlW200_R'];

  useEffect(() => {
    const urls: string[] = [];
    const collectUrls = (options: any[]) => {
        options.forEach(option => {
            urlKeys.forEach(key => {
              if (option[key] && typeof option[key] === 'string') urls.push(option[key]);
            });
            if (option.subOptions) collectUrls(option.subOptions);
        });
    };
    collectUrls(settings.doorTypes);

    // Also collect URLs from the new matrix
    if(settings.matrixPrices) {
        // FIX: Explicitly type `entry` to avoid type inference issues.
        Object.values(settings.matrixPrices).forEach((entry: MatrixPriceEntry) => {
            if (entry.url) urls.push(entry.url);
        });
    }
    
    const prefix = findCommonPrefix(urls);
    setCommonUrl(prefix || 'http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/');

    const newLocalSettings = JSON.parse(JSON.stringify(settings)); // Deep copy
    
    // Split URL for old doorTypes structure
    const replaceUrlsWithTails = (options: any[]) => {
        return options.map(option => {
            const newOption = { ...option };
            urlKeys.forEach(key => {
                if (prefix && typeof newOption[key] === 'string' && newOption[key].startsWith(prefix)) {
                    newOption[key] = newOption[key].substring(prefix.length);
                }
            });
            if (newOption.subOptions) {
                newOption.subOptions = replaceUrlsWithTails(newOption.subOptions);
            }
            return newOption;
        });
    };
    newLocalSettings.doorTypes = replaceUrlsWithTails(newLocalSettings.doorTypes);
    
    // Split URL for new matrixPrices structure
    const newMatrixPrices = newLocalSettings.matrixPrices || DEFAULT_MATRIX_PRICES;
    if (prefix) {
        Object.keys(newMatrixPrices).forEach(key => {
            if (newMatrixPrices[key].url?.startsWith(prefix)) {
                newMatrixPrices[key].url = newMatrixPrices[key].url.substring(prefix.length);
            }
        });
    }
    newLocalSettings.matrixPrices = newMatrixPrices;

    setLocalSettings(newLocalSettings);
  }, [settings]);


  type CategoryKey = 'doorTypes' | 'frameTypes' | 'colors' | 'handles' | 'glassStyles' | 'locks';
  type OptionField = 'price' | 'priceH2200' | 'priceH2400' | 'priceH90' | 'priceH120' 
                   | 'priceW80' | 'priceW120' | 'priceW160' | 'priceW200' 
                   | 'priceW80_R' | 'priceW120_R' | 'priceW160_R' | 'priceW200_R'
                   | 'detailDrawingUrl' | 'detailDrawingUrl_R'
                   | 'detailDrawingUrlW80' | 'detailDrawingUrlW120' | 'detailDrawingUrlW160' | 'detailDrawingUrlW200'
                   | 'detailDrawingUrlW80_R' | 'detailDrawingUrlW120_R' | 'detailDrawingUrlW160_R' | 'detailDrawingUrlW200_R';

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: CategoryKey,
    index: number,
    field: OptionField,
    subIndex?: number,
    isNumeric: boolean = true
  ) => {
    const rawValue = e.target.value;
    const value = isNumeric ? Number(rawValue) : rawValue;
    
    const updatedCategory = (localSettings[category] as any[]).map((option, i) => {
      if (i !== index) return option;

      if (subIndex === undefined) {
        return {
          ...option,
          [field]: isNumeric && isNaN(value as number) ? option[field] : value,
        };
      } else {
        const updatedSubOptions = option.subOptions.map((subOption: any, si: number) => {
            if (si !== subIndex) return subOption;
            return {
                ...subOption,
                [field]: isNumeric && isNaN(value as number) ? subOption[field] : value,
            };
        });
        return { ...option, subOptions: updatedSubOptions };
      }
    });

    setLocalSettings(prev => ({
      ...prev,
      [category]: updatedCategory,
    }));
  };

  const handleMatrixChange = (key: string, field: 'h90'|'h120'|'h2000'|'h2200'|'h2400'|'url', value: string) => {
    const isNumeric = field !== 'url';
    const parsedValue = isNumeric ? (Number(value) || 0) : value;

    setLocalSettings(prev => ({
        ...prev,
        matrixPrices: {
            ...prev.matrixPrices,
            [key]: {
                ...(prev.matrixPrices[key] || {}),
                [field]: parsedValue
            }
        }
    }));
  };
  
  const handleShippingRateChange = (prefecture: string, valueStr: string) => {
      const value = Number(valueStr);
      if (isNaN(value)) return;

      setLocalSettings(prev => ({
          ...prev,
          shippingRates: {
              ...prev.shippingRates,
              [prefecture]: value
          }
      }));
  };
  
  const handleDimensionChange = (rowId: string, field: keyof DimensionConfig, value: string) => {
      setLocalSettings(prev => ({
          ...prev,
          dimensionSettings: {
              ...prev.dimensionSettings,
              [rowId]: {
                  ...(prev.dimensionSettings[rowId] || { frameOuterW: '', frameInnerW: '', doorW: '', frameOuterH: '', frameInnerH: '', doorH: '', railLength: '' }),
                  [field]: value
              }
          }
      }));
  };

  const handleSaveChanges = () => {
    const settingsWithFullUrls = JSON.parse(JSON.stringify(localSettings));
    
    const getBaseUrl = () => {
        let base = commonUrl.trim();
        if (base && !base.endsWith('/')) {
            base += '/';
        }
        return base;
    }
    const baseUrl = getBaseUrl();
    const combineUrl = (tailUrl?: string) => {
        if (typeof tailUrl !== 'string' || !tailUrl.trim()) {
            return tailUrl || '';
        }
        return baseUrl + tailUrl.trim().replace(/^\//, '');
    };
    
    const reconstructUrls = (options: any[]) => {
        options.forEach(option => {
            urlKeys.forEach(key => {
              if (option.hasOwnProperty(key)) {
                  option[key] = combineUrl(option[key]);
              }
            });
            if (option.subOptions) {
                reconstructUrls(option.subOptions);
            }
        });
    };
    reconstructUrls(settingsWithFullUrls.doorTypes);
    
    // Reconstruct URLs for the matrix
    Object.keys(settingsWithFullUrls.matrixPrices).forEach(key => {
        if (settingsWithFullUrls.matrixPrices[key].url) {
            settingsWithFullUrls.matrixPrices[key].url = combineUrl(settingsWithFullUrls.matrixPrices[key].url);
        }
    });
    
    onUpdateSettings(settingsWithFullUrls);

    const simplifiedSettings = {
        doorTypes: settingsWithFullUrls.doorTypes.map((d: any) => ({
            id: d.id, 
            price: d.price, priceH2200: d.priceH2200, priceH2400: d.priceH2400,
            ...(d.priceH90 !== undefined ? { priceH90: d.priceH90 } : {}),
            ...(d.priceH120 !== undefined ? { priceH120: d.priceH120 } : {}),
            subOptions: d.subOptions?.map((s: any) => {
              const subOption: any = {
                id: s.id, 
                price: s.price, priceH2200: s.priceH2200, priceH2400: s.priceH2400,
              };
              if (s.priceH90 !== undefined) subOption.priceH90 = s.priceH90;
              if (s.priceH120 !== undefined) subOption.priceH120 = s.priceH120;
              if (s.priceW80 !== undefined) {
                  Object.assign(subOption, {
                      priceW80: s.priceW80, priceW120: s.priceW120, priceW160: s.priceW160, priceW200: s.priceW200,
                      priceW80_R: s.priceW80_R, priceW120_R: s.priceW120_R, priceW160_R: s.priceW160_R, priceW200_R: s.priceW200_R,
                  });
              }
              return subOption;
            })
        })),
        frameTypes: settingsWithFullUrls.frameTypes,
        colors: settingsWithFullUrls.colors,
        handles: settingsWithFullUrls.handles,
        glassStyles: settingsWithFullUrls.glassStyles,
        locks: settingsWithFullUrls.locks,
        shippingRates: settingsWithFullUrls.shippingRates,
        dimensionSettings: settingsWithFullUrls.dimensionSettings,
        matrixPrices: settingsWithFullUrls.matrixPrices,
    };
    
    const jsonString = JSON.stringify(simplifiedSettings, null, 2).replace(/"(http.*?)"/g, (match, url) => `"${url.replace(/\\/g, '')}"`);
    setExportJson(jsonString);
  };


  const copyToClipboard = () => {
      if (exportJson) {
          navigator.clipboard.writeText(exportJson).then(() => {
              alert("コピーしました！\nAIのチャット欄に貼り付けて送信してください。");
          }).catch(() => {
              alert("コピーに失敗しました。テキストエリアを選択して手動でコピーしてください。");
          });
      }
  };
  
  const renderInput = (
      category: CategoryKey, 
      index: number, 
      field: OptionField, 
      subIndex?: number, 
      isNumeric: boolean = true,
      placeholder: string = ""
  ) => (
    <div className="relative">
      <input 
        type={isNumeric ? "number" : "text"}
        value={
          subIndex === undefined
            ? (localSettings[category][index] as any)[field] || (isNumeric ? 0 : "")
            : (localSettings[category][index] as any).subOptions[subIndex][field] || (isNumeric ? 0 : "")
        }
        onChange={e => handleOptionChange(e, category, index, field, subIndex, isNumeric)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${isNumeric ? 'pl-2 pr-7 text-right' : 'px-2'} bg-white text-gray-900`}
      />
      {isNumeric && <span className="absolute inset-y-0 right-2 flex items-center text-gray-500 text-sm pointer-events-none">円</span>}
    </div>
  );

  const renderMatrixInput = (
    key: string,
    field: 'h90'|'h120'|'h2000'|'h2200'|'h2400'|'url',
    isNumeric: boolean,
    placeholder: string = ""
  ) => (
    <div className="relative">
        <input 
            type={isNumeric ? "number" : "text"}
            value={localSettings.matrixPrices?.[key]?.[field] ?? (isNumeric ? 0 : "")}
            onChange={e => handleMatrixChange(key, field, e.target.value)}
            placeholder={placeholder}
            className={`block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${isNumeric ? 'pl-2 pr-7 text-right' : 'px-2'} bg-white text-gray-900`}
        />
        {isNumeric && <span className="absolute inset-y-0 right-2 flex items-center text-gray-500 text-sm pointer-events-none">円</span>}
    </div>
  );

  const renderDoorPriceMatrix = () => {
    let lastGroup = '';
    let lastSubGroup = '';

    return (
        <div className="mb-6">
            <h4 className="text-xl font-bold my-4 bg-gray-100 p-2 rounded-md sticky top-0 z-10">ドア価格表</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-100 sticky top-0 z-20">
                        <tr>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-28">管理者設定</th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-28"></th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-48"></th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-24">H90</th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-24">H120</th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-24">H200</th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-24">H220</th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-24">H240</th>
                            <th className="border p-2 text-sm font-bold text-gray-600 w-48">末尾URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MATRIX_ROWS.map((row) => {
                            const showGroup = row.group !== lastGroup;
                            const showSubGroup = showGroup || row.subGroup !== lastSubGroup;
                            if (showGroup) lastGroup = row.group;
                            if (showSubGroup) lastSubGroup = row.subGroup;

                            const groupRowSpan = showGroup ? MATRIX_ROWS.filter(r => r.group === row.group).length : 0;
                            const subGroupRowSpan = showSubGroup ? MATRIX_ROWS.filter(r => r.group === row.group && r.subGroup === row.subGroup).length : 0;

                            return (
                                <tr key={row.key} className="bg-white hover:bg-gray-50">
                                    {showGroup && <td className="border p-2 text-sm font-semibold align-middle text-center" rowSpan={groupRowSpan}>{row.group}</td>}
                                    {showSubGroup && <td className="border p-2 text-sm font-semibold align-middle text-center" rowSpan={subGroupRowSpan}>{row.subGroup}</td>}
                                    <td className="border p-2 text-sm">{row.type}</td>
                                    <td className="border p-1">{renderMatrixInput(row.key, 'h90', true)}</td>
                                    <td className="border p-1">{renderMatrixInput(row.key, 'h120', true)}</td>
                                    <td className="border p-1">{renderMatrixInput(row.key, 'h2000', true)}</td>
                                    <td className="border p-1">{renderMatrixInput(row.key, 'h2200', true)}</td>
                                    <td className="border p-1">{renderMatrixInput(row.key, 'h2400', true)}</td>
                                    <td className="border p-1">{renderMatrixInput(row.key, 'url', false, '末尾URL')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };


  const renderSection = (title: string, key: CategoryKey, showUrl: boolean = false) => (
    <div className="mb-6">
      <h4 className="text-xl font-bold my-4 bg-gray-100 p-2 rounded-md sticky top-0 z-10">{title}</h4>
      
      {/* Header Row */}
      <div className={`grid ${showUrl ? 'grid-cols-7' : 'grid-cols-6'} gap-2 bg-white py-2 border-b-2 font-bold text-sm text-gray-600 px-2`}>
          <div className="col-span-1">項目名</div>
          <div className="text-right">H90</div>
          <div className="text-right">H120</div>
          <div className="text-right">H200</div>
          <div className="text-right">H2200</div>
          <div className="text-right">H2400</div>
          {showUrl && <div className="col-span-1 pl-2">末尾URL</div>}
      </div>

      <div className="space-y-2 pr-2 mt-2">
        {(localSettings[key] as any[]).map((option, index) => {
          if (['storage', 'hinged', 'sliding-single', 'sliding', 'double'].includes(option.id)) return null;

          return (
          <Fragment key={option.id}>
            <div className={`grid ${showUrl ? 'grid-cols-7' : 'grid-cols-6'} gap-2 items-center border-b last:border-b-0 py-1`}>
              <span className="col-span-1 truncate" title={option.name}>
                {option.name}
              </span>
              {renderInput(key, index, 'priceH90')}
              {renderInput(key, index, 'priceH120')}
              {renderInput(key, index, 'price')}
              {renderInput(key, index, 'priceH2200')}
              {renderInput(key, index, 'priceH2400')}
              {showUrl && <div className="col-span-1">{renderInput(key, index, 'detailDrawingUrl', undefined, false, "末尾URL")}</div>}
            </div>
            {option.subOptions && option.subOptions.map((subOption: any, subIndex: number) => (
              <div key={subOption.id} className={`grid ${showUrl ? 'grid-cols-7' : 'grid-cols-6'} gap-2 items-center border-b last:border-b-0 py-1 pl-6`}>
                <span className="col-span-1 truncate" title={subOption.name}>- {subOption.name}</span>
                {renderInput(key, index, 'priceH90', subIndex)}
                {renderInput(key, index, 'priceH120', subIndex)}
                {renderInput(key, index, 'price', subIndex)}
                {renderInput(key, index, 'priceH2200', subIndex)}
                {renderInput(key, index, 'priceH2400', subIndex)}
                {showUrl && <div className="col-span-1">{renderInput(key, index, 'detailDrawingUrl', subIndex, false, "末尾URL")}</div>}
              </div>
            ))}
          </Fragment>
        )})}
      </div>
    </div>
  );

  const renderMaterialSection = () => {
    const materialIndex = localSettings.doorTypes.findIndex(d => d.id === 'material');
    if (materialIndex === -1) return null;
    const materialOption = localSettings.doorTypes[materialIndex];

    return (
      <div className="mb-6">
        <h4 className="text-xl font-bold my-4 bg-gray-100 p-2 rounded-md sticky top-0 z-10">造作材 (Material)</h4>
        
        {/* Header Row */}
        <div className={`grid grid-cols-7 gap-2 bg-white py-2 border-b-2 font-bold text-sm text-gray-600 px-2`}>
            <div className="col-span-1">項目名</div>
            <div className="text-right">H90</div>
            <div className="text-right">H120</div>
            <div className="text-right">H200</div>
            <div className="text-right">H2200</div>
            <div className="text-right">H2400</div>
            <div className="col-span-1 pl-2">末尾URL</div>
        </div>

        <div className="space-y-2 pr-2 mt-2">
          {materialOption.subOptions?.map((subOption: any, subIndex: number) => (
            <div key={subOption.id} className={`grid grid-cols-7 gap-2 items-center border-b last:border-b-0 py-1 pl-6`}>
              <span className="col-span-1 truncate" title={subOption.name}>- {subOption.name}</span>
              {renderInput('doorTypes', materialIndex, 'priceH90', subIndex)}
              {renderInput('doorTypes', materialIndex, 'priceH120', subIndex)}
              {renderInput('doorTypes', materialIndex, 'price', subIndex)}
              {renderInput('doorTypes', materialIndex, 'priceH2200', subIndex)}
              {renderInput('doorTypes', materialIndex, 'priceH2400', subIndex)}
              <div className="col-span-1">{renderInput('doorTypes', materialIndex, 'detailDrawingUrl', subIndex, false, "末尾URL")}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStorageSection = () => {
      const storageIndex = localSettings.doorTypes.findIndex(d => d.id === 'storage');
      if (storageIndex === -1) return null;
      const storageOption = localSettings.doorTypes[storageIndex];

      return (
        <div className="mb-6">
          <h4 className="text-xl font-bold my-4 bg-gray-100 p-2 rounded-md sticky top-0 z-10">玄関収納 (Storage)</h4>
          <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                  {/* Custom Matrix Header */}
                  <div className="grid grid-cols-9 gap-2 bg-white py-2 border-b-2 font-bold text-sm text-gray-600 px-2">
                      <div className="col-span-1 flex items-end justify-start">
                          <span className="text-xs text-gray-400 mr-1">H / W</span>
                          <span>タイプ</span>
                      </div>
                      <div className="text-right">W800</div>
                      <div className="text-left">末尾URL</div>
                      <div className="text-right">W1200</div>
                      <div className="text-left">末尾URL</div>
                      <div className="text-right">W1600</div>
                      <div className="text-left">末尾URL</div>
                      <div className="text-right">W2000</div>
                      <div className="text-left">末尾URL</div>
                  </div>
                  
                  <div className="space-y-2 pr-2 mt-2">
                    {storageOption.subOptions?.map((subOption, subIndex) => {
                        const isLRType = ['storage-200-l', 'storage-200-u'].includes(subOption.id);
                        
                        return (
                            <React.Fragment key={subOption.id}>
                                <div className={`grid grid-cols-9 gap-2 items-center border-b last:border-b-0 py-2 ${isLRType ? 'bg-white' : ''}`}>
                                    <div className="col-span-1 pl-2">
                                        <div className="font-medium truncate" title={subOption.name}>{subOption.name}</div>
                                        {isLRType && <div className="text-xs text-gray-500 font-bold mt-1">Lタイプ (左勝手)</div>}
                                    </div>
                                    {renderInput('doorTypes', storageIndex, 'priceW80', subIndex)}
                                    {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW80', subIndex, false, "末尾URL")}
                                    {renderInput('doorTypes', storageIndex, 'priceW120', subIndex)}
                                    {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW120', subIndex, false, "末尾URL")}
                                    {renderInput('doorTypes', storageIndex, 'priceW160', subIndex)}
                                    {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW160', subIndex, false, "末尾URL")}
                                    {renderInput('doorTypes', storageIndex, 'priceW200', subIndex)}
                                    {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW200', subIndex, false, "末尾URL")}
                                </div>
                                {isLRType && (
                                    <div className="grid grid-cols-9 gap-2 items-center border-b last:border-b-0 py-2 bg-gray-50/50">
                                        <div className="col-span-1 pl-2 text-right pr-4">
                                            <span className="text-xs text-gray-500 font-bold">Rタイプ (右勝手)</span>
                                        </div>
                                        {renderInput('doorTypes', storageIndex, 'priceW80_R', subIndex, true, "同上")}
                                        {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW80_R', subIndex, false, "末尾URL")}
                                        {renderInput('doorTypes', storageIndex, 'priceW120_R', subIndex, true, "同上")}
                                        {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW120_R', subIndex, false, "末尾URL")}
                                        {renderInput('doorTypes', storageIndex, 'priceW160_R', subIndex, true, "同上")}
                                        {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW160_R', subIndex, false, "末尾URL")}
                                        {renderInput('doorTypes', storageIndex, 'priceW200_R', subIndex, true, "同上")}
                                        {renderInput('doorTypes', storageIndex, 'detailDrawingUrlW200_R', subIndex, false, "末尾URL")}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                  </div>
              </div>
          </div>
        </div>
      );
  };

  const renderShippingRates = () => (
      <div className="mb-6">
          <h4 className="text-xl font-bold my-4 bg-gray-100 p-2 rounded-md sticky top-0 z-10">運賃一覧 (Shipping Rates)</h4>
          <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">都道府県</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">運賃 (円)</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {PREFECTURES.map(pref => (
                          <tr key={pref}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pref}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="relative inline-block w-full max-w-xs">
                                      <input
                                          type="number"
                                          value={localSettings.shippingRates[pref] || 0}
                                          onChange={(e) => handleShippingRateChange(pref, e.target.value)}
                                          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm pl-2 pr-7 text-right bg-white text-gray-900 border h-9 focus:ring-black focus:border-black"
                                      />
                                      <span className="absolute inset-y-0 right-2 flex items-center text-gray-500 text-sm pointer-events-none">円</span>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderDimensionTable = () => (
      <div className="mb-6">
          <h4 className="text-xl font-bold my-4 bg-gray-100 p-2 rounded-md sticky top-0 z-10">寸法詳細 (Dimensional Details)</h4>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                      <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">グループ</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">詳細</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">枠外W</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">枠内W</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ドアW</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">枠外H</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">枠内H</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ドアH</th>
                          <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">上吊レール長さ</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {DIMENSION_ROWS.map((row, idx) => {
                          const config = localSettings.dimensionSettings[row.id] || { frameOuterW: '', frameInnerW: '', doorW: '', frameOuterH: '', frameInnerH: '', doorH: '', railLength: '' };
                          const isStartOfGroup = idx === 0 || DIMENSION_ROWS[idx - 1].group !== row.group;
                          const rowSpan = DIMENSION_ROWS.filter(r => r.group === row.group).length;

                          return (
                              <tr key={row.id} className="hover:bg-gray-50">
                                  {isStartOfGroup && (
                                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900 border-r bg-gray-50" rowSpan={rowSpan}>
                                          {row.group}
                                      </td>
                                  )}
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 border-r">{row.label}</td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.frameOuterW || ''} onChange={(e) => handleDimensionChange(row.id, 'frameOuterW', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.frameInnerW || ''} onChange={(e) => handleDimensionChange(row.id, 'frameInnerW', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.doorW || ''} onChange={(e) => handleDimensionChange(row.id, 'doorW', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.frameOuterH || ''} onChange={(e) => handleDimensionChange(row.id, 'frameOuterH', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.frameInnerH || ''} onChange={(e) => handleDimensionChange(row.id, 'frameInnerH', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.doorH || ''} onChange={(e) => handleDimensionChange(row.id, 'doorH', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                                  <td className="px-1 py-1">
                                      <input type="text" value={config.railLength || ''} onChange={(e) => handleDimensionChange(row.id, 'railLength', e.target.value)} className="w-full border-gray-300 rounded text-sm p-1 border focus:ring-black focus:border-black text-center" />
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
            </div>
          </div>
      </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col relative">
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-6">
             <h2 className="text-2xl font-bold">管理者設定</h2>
             <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setActiveTab('doorPrices')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'doorPrices' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                 >
                    価格設定
                 </button>
                 <button 
                    onClick={() => setActiveTab('shipping')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'shipping' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                 >
                    運賃一覧
                 </button>
                 <button 
                    onClick={() => setActiveTab('dimensions')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dimensions' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                 >
                    【寸法詳細】
                 </button>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
        </header>
        <main className="flex-grow overflow-y-auto px-6 pb-6">
            {activeTab === 'doorPrices' && (
                <>
                    <div className="my-4 p-4 rounded-md border border-gray-200 bg-gray-50">
                        <label htmlFor="commonUrl" className="block text-sm font-bold text-gray-700 mb-2">共通URL</label>
                        <input
                            id="commonUrl"
                            type="text"
                            value={commonUrl}
                            onChange={(e) => setCommonUrl(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                            placeholder="例: http://example.com/path/to/pdfs/"
                        />
                    </div>
                    {renderDoorPriceMatrix()}
                    <hr className="my-8" />
                    <h3 className="text-2xl font-bold mb-4">その他の価格設定</h3>
                    {renderMaterialSection()}
                    {renderStorageSection()}
                    {renderSection('枠種類', 'frameTypes')}
                    {renderSection('カラー', 'colors')}
                    {renderSection('ドアハンドル', 'handles')}
                    {renderSection('錠 (Lock)', 'locks')}
                    {renderSection('ガラス', 'glassStyles')}
                </>
            )}
            {activeTab === 'shipping' && renderShippingRates()}
            {activeTab === 'dimensions' && renderDimensionTable()}
        </main>
        <footer className="p-4 border-t flex justify-end gap-4 flex-shrink-0 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">キャンセル</button>
          <button onClick={handleSaveChanges} className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition-colors shadow-md flex flex-col items-center leading-none py-1">
            <span className="text-sm mb-0.5">変更内容を</span>
            <span className="text-xs font-normal">プロンプトで表示</span>
          </button>
        </footer>

        {/* Export JSON Modal */}
        {exportJson && (
            <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-6">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-3/4 flex flex-col p-6">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">設定保存用データ</h3>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                            以下のテキストエリア内のコードをすべてコピーし、<b>このチャット（AI）の入力欄に貼り付けて送信</b>してください。<br/>
                            これにより、入力した金額がアプリの初期値として永久に保存されます。
                        </p>
                    </div>
                    <textarea 
                        readOnly 
                        value={exportJson}
                        className="flex-grow w-full p-4 bg-gray-800 text-green-400 font-mono text-xs rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black mb-4"
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={() => { setExportJson(null); onClose(); }}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-colors"
                        >
                            閉じる
                        </button>
                        <button 
                            onClick={copyToClipboard}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 font-bold shadow-lg transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            クリップボードにコピー
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
