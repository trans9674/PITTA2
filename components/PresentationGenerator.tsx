
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SavedDoor, DoorOption, DoorTypeId, FrameTypeId, ColorOption, HandleId, GlassStyleId, LockId, ProjectInfo } from '../types';
import PrintDoorPreview from './PrintDoorPreview';
import { getOptionName } from '../utils';

interface Props {
  type: 'presentation' | 'quotation';
  doors: SavedDoor[];
  settings: {
    doorTypes: DoorOption<DoorTypeId>[];
    frameTypes: DoorOption<FrameTypeId>[];
    colors: ColorOption[];
    handles: DoorOption<HandleId>[];
    glassStyles: DoorOption<GlassStyleId>[];
    locks: DoorOption<LockId>[];
  };
  projectInfo: ProjectInfo;
}

const PrintLayout: React.FC<Props> = ({ type, doors, settings, projectInfo }) => {
  const [showPrice, setShowPrice] = useState(false);
  
  const doorsTotal = doors.reduce((sum, d) => sum + d.price, 0);
  const shippingCost = projectInfo.shippingCost || 0;
  const subTotal = doorsTotal + shippingCost;
  const taxAmount = Math.floor(subTotal * 0.1);
  const totalWithTax = subTotal + taxAmount;
  
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  if (type === 'presentation') {
    return (
      <div className="min-h-screen bg-white text-gray-900 w-full box-border">
        {/* Controls - Hidden on Print */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-2 flex justify-between items-center shadow-md print:hidden z-50">
           <div className="flex items-center gap-4">
              <span className="font-bold text-gray-700 text-sm">表示設定:</span>
              <div className="flex items-center bg-gray-100 rounded p-1">
                  <button 
                    onClick={() => setShowPrice(false)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${!showPrice ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    金額なし
                  </button>
                  <button 
                    onClick={() => setShowPrice(true)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${showPrice ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    金額あり
                  </button>
              </div>
           </div>
           <button 
             onClick={handlePrint}
             className="px-4 py-1 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md text-sm"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
             </svg>
             印刷する
           </button>
        </div>
        
        {/* Spacer */}
        <div className="h-12 print:hidden"></div>

        <div className="p-4 mx-auto w-full max-w-[420mm]">
            <div className="flex justify-between items-end border-b border-gray-800 pb-1 mb-2">
            <div>
                <h1 className="text-lg font-bold mb-0.5">プレゼンテーションボード</h1>
                <div className="flex gap-4 text-xs text-gray-800">
                    {projectInfo.customerName && <span className="font-bold">{projectInfo.customerName} 様邸</span>}
                    {projectInfo.constructionLocation && <span>建築地: {projectInfo.constructionLocation}</span>}
                    {projectInfo.constructionCompany && <span>{projectInfo.constructionCompany} 御中</span>}
                </div>
            </div>
            <div className="text-right">
                <p className="text-[8px] text-gray-600">作成日: {today}</p>
                <p className="text-sm font-bold">PITTA</p>
            </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
            {doors.map((door, index) => {
                const isMaterial = door.config.doorType.startsWith('material-');
                const isStorage = door.config.doorType.startsWith('storage-');
                let idPrefix = 'WD';
                if (isStorage) idPrefix = 'SB';
                if (isMaterial) idPrefix = '造作材';

                const roomName = door.roomName || '名称未設定';
                const doorTypeName = getOptionName(settings.doorTypes, door.config.doorType);
                const colorName = getOptionName(settings.colors, door.config.color);
                const shortColorId = settings.colors.find(c => c.id === door.config.color)?.shortId || '';
                
                const showHingeSide = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(door.config.doorType);
                const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(door.config.doorType);
                const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(door.config.doorType);
                const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(door.config.doorType);
                
                let hingeSideText = '';
                let hingeLabel = '吊元';
                if (showHingeSide) {
                    if (isPocketSliding) {
                        hingeSideText = door.config.hingeSide === 'right' ? '右戸袋' : '左戸袋';
                        hingeLabel = '戸袋';
                    } else if (isKataSliding) {
                        hingeSideText = door.config.hingeSide === 'right' ? '右勝手' : '左勝手';
                        hingeLabel = '勝手';
                    } else if (isStorageLR) {
                        hingeSideText = door.config.hingeSide === 'right' ? 'Rタイプ' : 'Lタイプ';
                        hingeLabel = 'タイプ';
                    } else {
                        hingeSideText = door.config.hingeSide === 'right' ? '左吊元' : '右吊元';
                    }
                }
                
                const showFrame = !isStorage && !isMaterial;
                const frameTypeName = showFrame ? getOptionName(settings.frameTypes, door.config.frameType) : '';
                
                const showLock = door.config.lock && door.config.lock !== 'none';
                
                const showGlass = door.config.glassStyle && door.config.glassStyle !== 'none';
                const glassName = showGlass ? getOptionName(settings.glassStyles, door.config.glassStyle) : '';

                return (
                <div key={door.id} className="border border-gray-200 rounded p-1 bg-white flex flex-row items-start break-inside-avoid overflow-hidden" style={{ height: '120px' }}>
                    {/* Details Section (Left) */}
                    <div className="flex-grow pr-1 min-w-0">
                        <div className="mb-0.5 border-b border-gray-100 pb-0.5">
                            <h3 className="font-bold text-sm leading-none">{idPrefix}{!isMaterial ? index + 1 : ''} <span className="text-[10px] font-normal text-gray-500 ml-1">{roomName}</span></h3>
                        </div>
                        
                        <div className="text-[10px] text-gray-700 space-y-[0px] leading-tight font-medium">
                            <p className="truncate"><span className="text-gray-400">種類:</span> {doorTypeName}</p>
                            {!isMaterial && (
                                <p><span className="text-gray-400">サイズ:</span> W{door.config.width.toFixed(1)}×H{door.config.height}</p>
                            )}
                            {isMaterial && (
                                <p><span className="text-gray-400">数量:</span> {door.config.count}</p>
                            )}
                            <p className="truncate"><span className="text-gray-400">色:</span> {colorName} ({shortColorId})</p>
                            {hingeSideText && <p className="truncate"><span className="text-gray-400">{hingeLabel}:</span> {hingeSideText}</p>}
                            {frameTypeName && <p className="truncate"><span className="text-gray-400">枠:</span> {frameTypeName}</p>}
                            
                            {showGlass && (
                                <p className="truncate">
                                    <span className="font-bold text-red-600">{glassName}</span>
                                </p>
                            )}

                            {showLock && (
                                <p className="truncate">
                                    <span className="font-bold text-red-600">表示錠あり</span>
                                </p>
                            )}
                            
                            {showPrice && <p className="font-bold text-[10px] mt-0.5 text-black">¥{door.price.toLocaleString()}</p>}
                        </div>
                    </div>

                    {/* Image Section (Right) - Fixed Size */}
                    {!isMaterial && (
                    <div className="flex-shrink-0 bg-gray-50 border border-gray-100 rounded flex items-center justify-center preview-box" style={{ width: '80px', height: '80px' }}>
                        <PrintDoorPreview config={door.config} colors={settings.colors} />
                    </div>
                    )}
                </div>
            )})}
            </div>
            
            {showPrice && (
            <div className="mt-2 border-t border-gray-200 pt-1 flex justify-end">
                <div className="text-right">
                    <p className="text-[10px] text-gray-500">合計金額 (税別)</p>
                    <p className="text-sm font-bold">¥{doorsTotal.toLocaleString()}</p>
                </div>
            </div>
            )}
        </div>
      </div>
    );
  }

  if (type === 'quotation') {
    return (
      <div className="p-10 mx-auto bg-white min-h-screen text-gray-900 w-full box-border text-sm quotation-table-container">
        <style>{`
            @media print {
                .quotation-table-container table { width: 100%; border-collapse: collapse; }
                .quotation-table-container th, .quotation-table-container td { border-bottom: 1px solid #e5e7eb; }
            }
        `}</style>
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex justify-end items-center shadow-md print:hidden z-50">
           <button 
             onClick={handlePrint}
             className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
             </svg>
             印刷する
           </button>
        </div>
        <div className="h-16 print:hidden"></div>

        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold mb-4">御見積書</h1>
                <div className="space-y-1">
                    <p className="text-lg font-bold underline decoration-1 underline-offset-4 mb-2">{projectInfo.constructionCompany} 御中</p>
                    <p className="text-base font-bold mb-2">{projectInfo.customerName} 様邸内部ドア</p>
                    <p>建築地: {projectInfo.constructionLocation}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">No. {Date.now().toString().slice(-8)}</p>
                <p className="text-xs text-gray-500 mb-4">発行日: {today}</p>
                <div className="bg-gray-100 p-4 rounded-lg w-64">
                    <p className="text-sm text-gray-600 mb-1">御見積合計金額 (税込)</p>
                    <p className="text-2xl font-bold">¥{totalWithTax.toLocaleString()}</p>
                </div>
            </div>
        </div>

        <table className="w-full mb-8 border-collapse text-sm">
            <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-left">
                    <th className="py-2 px-2 w-10">No.</th>
                    <th className="py-2 px-2">品名 / 仕様</th>
                    <th className="py-2 px-2 w-16">数量</th>
                    <th className="py-2 px-2 w-16">単位</th>
                    <th className="py-2 px-2 w-24 text-right">単価</th>
                    <th className="py-2 px-2 w-24 text-right">金額</th>
                </tr>
            </thead>
            <tbody>
                {doors.map((door, index) => {
                    const isMaterial = door.config.doorType.startsWith('material-');
                    const isStorage = door.config.doorType.startsWith('storage-');
                    let idPrefix = 'WD';
                    if (isStorage) idPrefix = 'SB';
                    if (isMaterial) idPrefix = '造作材';
                    
                    const doorTypeName = getOptionName(settings.doorTypes, door.config.doorType);
                    const colorName = getOptionName(settings.colors, door.config.color);
                    const shortColorId = settings.colors.find(c => c.id === door.config.color)?.shortId || '';
                    const handleName = getOptionName(settings.handles, door.config.handle);
                    
                    const showHingeSide = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(door.config.doorType);
                    const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(door.config.doorType);
                    const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(door.config.doorType);
                    const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(door.config.doorType);
                    
                    let hingeSideText = '';
                    if (showHingeSide) {
                        if (isPocketSliding) {
                            hingeSideText = door.config.hingeSide === 'right' ? '右戸袋' : '左戸袋';
                        } else if (isKataSliding) {
                            hingeSideText = door.config.hingeSide === 'right' ? '右勝手' : '左勝手';
                        } else if (isStorageLR) {
                            hingeSideText = door.config.hingeSide === 'right' ? 'Rタイプ' : 'Lタイプ';
                        } else {
                            hingeSideText = door.config.hingeSide === 'right' ? '左吊元' : '右吊元';
                        }
                    }

                    const showFrame = !isStorage && !isMaterial;
                    const frameTypeName = showFrame ? getOptionName(settings.frameTypes, door.config.frameType) : '';

                    // Construct details string
                    const details = [];
                    if (door.roomName) details.push(`[${door.roomName}]`);
                    details.push(`カラー: ${colorName} (${shortColorId})`);
                    if (!isMaterial) details.push(`サイズ: W${door.config.width.toFixed(1)}×H${door.config.height}`);
                    if (hingeSideText) details.push(hingeSideText);
                    if (frameTypeName) details.push(frameTypeName);
                    if (!isStorage && !isMaterial && door.config.handle) details.push(`ハンドル: ${handleName}`);
                    if (door.config.glassStyle !== 'none') details.push(`ガラス: ${getOptionName(settings.glassStyles, door.config.glassStyle)}`);
                    if (door.config.lock && door.config.lock !== 'none') details.push(`錠: ${getOptionName(settings.locks, door.config.lock)}`);

                    return (
                        <tr key={door.id} className="border-b border-gray-200">
                            <td className="py-2 px-2 align-top">{!isMaterial ? `${idPrefix}${index + 1}` : '-'}</td>
                            <td className="py-2 px-2">
                                <p className="font-bold text-sm">{doorTypeName}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{details.join(' / ')}</p>
                            </td>
                            <td className="py-2 px-2 align-top">{isMaterial ? door.config.count : 1}</td>
                            <td className="py-2 px-2 align-top">{isMaterial ? (door.config.doorType === 'material-corner-skirting' ? '個' : '本') : '式'}</td>
                            <td className="py-2 px-2 text-right align-top">
                                {isMaterial 
                                    ? `¥${(door.price / (door.config.count || 1)).toLocaleString()}` 
                                    : `¥${door.price.toLocaleString()}`
                                }
                            </td>
                            <td className="py-2 px-2 text-right align-top">¥{door.price.toLocaleString()}</td>
                        </tr>
                    );
                })}
                
                {shippingCost > 0 && (
                    <tr className="border-b border-gray-200">
                        <td className="py-2 px-2">-</td>
                        <td className="py-2 px-2 font-bold">運賃</td>
                        <td className="py-2 px-2">1</td>
                        <td className="py-2 px-2">式</td>
                        <td className="py-2 px-2 text-right">¥{shippingCost.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right">¥{shippingCost.toLocaleString()}</td>
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr className="bg-gray-50">
                    <td colSpan={4} className="py-2 px-2 font-bold text-right">小計</td>
                    <td colSpan={2} className="py-2 px-2 font-bold text-right">¥{subTotal.toLocaleString()}</td>
                </tr>
                <tr>
                    <td colSpan={4} className="py-2 px-2 font-bold text-right">消費税 (10%)</td>
                    <td colSpan={2} className="py-2 px-2 font-bold text-right">¥{taxAmount.toLocaleString()}</td>
                </tr>
                <tr className="border-t-2 border-black">
                    <td colSpan={4} className="py-3 px-2 font-bold text-right text-lg">合計金額</td>
                    <td colSpan={2} className="py-3 px-2 font-bold text-right text-lg">¥{totalWithTax.toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>
        
        <div className="mt-8 text-xs text-gray-500">
            <p>※ 本見積書の有効期限は発行日より1ヶ月とさせていただきます。</p>
            <p>※ 仕様変更等により金額が変更となる場合がございます。</p>
        </div>
      </div>
    );
  }

  return null;
};

export const generateDocument = (
  type: 'presentation' | 'quotation', 
  doors: SavedDoor[], 
  settings: Props['settings'],
  projectInfo: ProjectInfo
) => {
  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('ポップアップがブロックされました。許可してください。');
    return;
  }

  newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${type === 'presentation' ? 'プレゼンテーションボード' : '御見積書'}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Noto Sans JP', sans-serif; -webkit-print-color-adjust: exact; }
        @media print {
          @page { size: ${type === 'presentation' ? 'A3 landscape' : 'A4 portrait'}; margin: 0; }
          body { margin: 0; }
          img, svg { max-width: 100% !important; height: auto !important; }
        }
        /* Force fixed size for preview box in all contexts to prevent scaling bugs */
        .preview-box {
            width: 80px !important;
            height: 80px !important;
            min-width: 80px !important;
            min-height: 80px !important;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background-color: #f9fafb; /* bg-gray-50 */
            border: 1px solid #f3f4f6; /* border-gray-100 */
        }
        .preview-box > div {
            width: 100% !important;
            height: 100% !important;
        }
      </style>
    </head>
    <body>
      <div id="print-root"></div>
    </body>
    </html>
  `);

  newWindow.document.close();

  const intervalId = setInterval(() => {
    if (newWindow.closed) {
      clearInterval(intervalId);
      return;
    }

    const container = newWindow.document.getElementById('print-root');
    if (container) {
      clearInterval(intervalId);
      const root = createRoot(container);
      root.render(<PrintLayout type={type} doors={doors} settings={settings} projectInfo={projectInfo} />);
    }
  }, 100);

  setTimeout(() => clearInterval(intervalId), 10000);
};

export default PrintLayout;
