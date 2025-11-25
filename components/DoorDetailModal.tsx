import React, { useEffect, useState } from 'react';
import { SavedDoor, DoorOption, DoorTypeId, FrameTypeId, ColorOption, HandleId, GlassStyleId, LockId, DimensionSettings, ProjectInfo, DoorConfiguration, MatrixPrices } from '../types';
import { getOptionName, buildMatrixKey } from '../utils';

interface DoorDetailModalProps {
  door: SavedDoor;
  doorIndex: number;
  onClose: () => void;
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
  glassStyles: DoorOption<GlassStyleId>[];
  locks: DoorOption<LockId>[];
  dimensionSettings: DimensionSettings;
  projectInfo: ProjectInfo;
  matrixPrices: MatrixPrices;
}

const calculateDimension = (formula: string, w_mm: number, h_mm: number): string => {
    if (!formula) return '-';
    try {
        const expression = formula.toUpperCase()
            .replace(/W/g, w_mm.toString())
            .replace(/H/g, h_mm.toString());
        const result = new Function('return ' + expression)();
        return (Math.round(result * 10) / 10).toString();
    } catch (e) {
        return '-';
    }
};

const getDimensionKey = (config: any): string => {
    const type = config.doorType;
    const frame = config.frameType === 'threeWay' ? '3way' : '2way';
    
    if (type === 'hinged') return `hinged_${frame}`;
    if (type === 'hinged-storage') return `hinged_storage_${frame}`;
    if (type === 'double') return `double_${frame}`;
    if (type === 'sliding-2') return `sliding_2_${frame}`;
    if (type === 'sliding-3') return `sliding_3_${frame}`;
    if (type === 'sliding-4') return `sliding_4_${frame}`;
    if (type === 'sliding-kata-2') return `sliding_kata_2_${frame}`;
    if (type === 'sliding-kata-3') return `sliding_kata_3_${frame}`;
    if (type === 'folding-2') return `folding_2_${frame}`;
    if (type === 'folding-4') return `folding_4_${frame}`;
    if (type === 'folding-6') return `folding_6_${frame}`;
    if (type === 'folding-8') return `folding_8_${frame}`;
    if (type === 'sliding-outset') {
        if (config.lock === 'display-lock') return 'sliding_outset_lock';
        return 'sliding_outset_normal';
    }
    if (type === 'sliding-inset' || type === 'sliding-hikikomi') {
        if (config.height <= 200) return 'sliding_inset_h2000_wall';
        return 'sliding_inset_h2200_ceiling';
    }
    return '';
};

const DoorDetailModal: React.FC<DoorDetailModalProps> = ({
  door,
  doorIndex,
  onClose,
  doorTypes,
  frameTypes,
  colors,
  handles,
  glassStyles,
  locks,
  dimensionSettings,
  projectInfo,
  matrixPrices
}) => {
    const { config, roomName } = door;
    const isStorage = config.doorType.startsWith('storage-');
    const isMaterial = config.doorType.startsWith('material-');

    const w_mm = config.width * 10;
    const h_mm = config.height * 10;
    
    const dimKey = getDimensionKey(config);
    const dimSetting = dimensionSettings ? dimensionSettings[dimKey] : null;
    
    let dimensions = null;
    if (dimSetting && !isMaterial) {
         dimensions = {
            frameOuterW: calculateDimension(dimSetting.frameOuterW, w_mm, h_mm),
            frameInnerW: calculateDimension(dimSetting.frameInnerW, w_mm, h_mm),
            doorW: calculateDimension(dimSetting.doorW, w_mm, h_mm),
            frameOuterH: calculateDimension(dimSetting.frameOuterH, w_mm, h_mm),
            frameInnerH: calculateDimension(dimSetting.frameInnerH, w_mm, h_mm),
            doorH: calculateDimension(dimSetting.doorH, w_mm, h_mm),
            railLength: calculateDimension(dimSetting.railLength, w_mm, h_mm)
         };
    }

    const [visible, setVisible] = useState(false);
    useEffect(() => {
        setVisible(true);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    let idPrefix = 'WD';
    if (isStorage) idPrefix = 'SB';
    if (isMaterial) idPrefix = '造作材';
    
    const displayIndex = isMaterial ? '' : (doorIndex + 1);
    
    const doorTypeName = getOptionName(doorTypes, config.doorType) || '未選択';
    
    const colorOption = colors.find(c => c.id === config.color);
    const colorName = colorOption ? colorOption.name : '未選択';
    const shortColorId = colorOption?.shortId || '';
    const displayColor = shortColorId ? `${colorName} (${shortColorId})` : colorName;

    const frameTypeName = !isStorage && !isMaterial ? getOptionName(frameTypes, config.frameType) : '-';
    const showHandle = !['double', 'hinged-storage'].includes(config.doorType) && !config.doorType.startsWith('folding-') && !isStorage && !isMaterial;
    const handleName = showHandle ? getOptionName(handles, config.handle) : '-';
    
    const glassName = config.glassStyle !== 'none' ? getOptionName(glassStyles, config.glassStyle) : 'なし';
    const lockName = config.lock && config.lock !== 'none' ? getOptionName(locks, config.lock) : 'なし';
    const displayLock = config.lock === 'display-lock' ? '表示錠あり' : lockName;

    const detailDrawingUrl = (() => {
        const matrixKey = buildMatrixKey(config);
        if (matrixPrices?.[matrixKey]?.url) {
            return matrixPrices[matrixKey].url;
        }

        let targetOption: DoorOption<any> | undefined;
        for (const option of doorTypes) {
            if (option.id === config.doorType) {
                targetOption = option;
                break;
            } else if (option.subOptions) {
                const found = option.subOptions.find(s => s.id === config.doorType);
                if (found) {
                    targetOption = found;
                    break;
                }
            }
        }

        if (targetOption) {
            if (config.doorType.startsWith('storage-')) {
                const isRType = ['storage-200-l', 'storage-200-u'].includes(config.doorType) && config.hingeSide === 'right';
                let url;
                switch (config.width) {
                    case 80:  url = isRType ? targetOption.detailDrawingUrlW80_R : targetOption.detailDrawingUrlW80; break;
                    case 120: url = isRType ? targetOption.detailDrawingUrlW120_R : targetOption.detailDrawingUrlW120; break;
                    case 160: url = isRType ? targetOption.detailDrawingUrlW160_R : targetOption.detailDrawingUrlW160; break;
                    case 200: url = isRType ? targetOption.detailDrawingUrlW200_R : targetOption.detailDrawingUrlW200; break;
                }
                
                if (isRType && !url) {
                     switch (config.width) {
                        case 80:  url = targetOption.detailDrawingUrlW80; break;
                        case 120: url = targetOption.detailDrawingUrlW120; break;
                        case 160: url = targetOption.detailDrawingUrlW160; break;
                        case 200: url = targetOption.detailDrawingUrlW200; break;
                    }
                }
                
                if (!url) {
                    url = isRType ? targetOption.detailDrawingUrl_R : targetOption.detailDrawingUrl;
                }
                return url;
            }
            return targetOption.detailDrawingUrl;
        }
        return undefined;
    })();

    const showHingeSide = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(config.doorType);
    const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
    const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(config.doorType);
    const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(config.doorType);
    
    let hingeSideText = '-';
    let hingeLabel = '吊元';
    if (showHingeSide) {
        if (isPocketSliding) {
            hingeSideText = config.hingeSide === 'right' ? '右戸袋' : '左戸袋';
            hingeLabel = '戸袋';
        } else if (isKataSliding) {
            hingeSideText = config.hingeSide === 'right' ? '右勝手' : '左勝手';
            hingeLabel = '勝手';
        } else if (isStorageLR) {
            hingeSideText = config.hingeSide === 'right' ? 'Rタイプ' : 'Lタイプ';
            hingeLabel = 'タイプ';
        } else {
            hingeSideText = config.hingeSide === 'right' ? '左吊元' : '右吊元';
        }
    }

    const handleViewDrawing = () => {
        if (!detailDrawingUrl) return;
        const cleanUrl = detailDrawingUrl.replace(/^https?:\/\//, '');
        const bgImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=jpg&w=2400`;

        const newWindow = window.open('', '_blank');
        if (!newWindow) {
            alert('ポップアップがブロックされました。許可してください。');
            return;
        }

        const specRows = `
            <tr><th>品番</th><td>${idPrefix}${displayIndex} (${roomName || '名称なし'})</td></tr>
            <tr><th>種類</th><td>${doorTypeName}</td></tr>
            <tr><th>サイズ</th><td>W${config.width.toFixed(1)} × H${config.height}</td></tr>
            <tr><th>枠</th><td>${frameTypeName}</td></tr>
            <tr><th>カラー</th><td>${displayColor}</td></tr>
            <tr><th>${hingeLabel}</th><td>${hingeSideText}</td></tr>
            ${showHandle ? `<tr><th>ハンドル</th><td>${handleName}</td></tr>` : ''}
            ${config.glassStyle !== 'none' ? `<tr><th>ガラス</th><td>${glassName}</td></tr>` : ''}
            ${config.lock && config.lock !== 'none' ? `<tr><th>錠</th><td>${displayLock}</td></tr>` : ''}
        `;

        const html = `
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <title>${idPrefix}${displayIndex} 詳細図</title>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    @page { size: A3 landscape; margin: 0; }
                    body { margin: 0; padding: 0; font-family: 'Noto Sans JP', sans-serif; background-color: #333; }
                    .page {
                        position: relative;
                        width: 420mm;
                        height: 297mm;
                        background-image: url('${bgImageUrl}');
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        background-color: white;
                        margin: 20px auto;
                        box-shadow: 0 0 20px rgba(0,0,0,0.5);
                    }
                    @media print {
                        body { background-color: white; }
                        .page { margin: 0; box-shadow: none; }
                        .print-btn { display: none; }
                    }
                    .wd-number {
                        position: absolute;
                        top: 20mm;
                        left: 20mm;
                        font-size: 48px;
                        font-weight: bold;
                        background-color: white;
                        padding: 5px 20px;
                        border: 2px solid black;
                    }
                    .spec-panel {
                        position: absolute;
                        bottom: 40mm;
                        left: 20mm;
                        width: 350px;
                        background: white;
                        border: 2px solid #333;
                        padding: 15px;
                        font-size: 12px;
                        border-radius: 4px;
                        box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
                    }
                    .spec-panel h2 {
                        margin: 0 0 10px 0;
                        font-size: 16px;
                        border-bottom: 1px solid #333;
                        padding-bottom: 4px;
                    }
                    .spec-panel table { width: 100%; border-collapse: collapse; }
                    .spec-panel th, .spec-panel td { border-bottom: 1px solid #ddd; padding: 4px 8px; text-align: left; }
                    .spec-panel th { background-color: #f5f5f5; width: 30%; white-space: nowrap; }
                    .spec-panel td { font-weight: bold; }
                    
                    .footer-info {
                        position: absolute;
                        bottom: 15mm;
                        left: 45mm;
                        right: 45mm;
                        display: flex;
                        justify-content: space-between;
                        font-size: 18px;
                        font-weight: bold;
                        background-color: rgba(255,255,255,0.8);
                        padding: 5px 10px;
                    }
                    .print-btn {
                        position: fixed; top: 20px; right: 20px; padding: 10px 20px;
                        background: black; color: white; border: none; border-radius: 5px;
                        cursor: pointer; font-weight: bold; z-index: 100;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">印刷する (PDF保存)</button>
                <div class="page">
                    <div class="wd-number">${idPrefix}${displayIndex}</div>
                    
                    <div class="spec-panel">
                        <h2>仕様詳細</h2>
                        <table>
                            ${specRows}
                        </table>
                    </div>

                    <div class="footer-info">
                        <span>物件名：${projectInfo.customerName || ''} 様邸</span>
                        <span>施工会社：${projectInfo.constructionCompany || ''} 御中</span>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        newWindow.document.write(html);
        newWindow.document.close();
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                {idPrefix}{displayIndex} <span className="text-lg font-normal text-gray-500">({roomName || '名称未設定'})</span>
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {projectInfo?.customerName || ''} 様邸 {projectInfo?.constructionCompany ? `/ ${projectInfo.constructionCompany}` : ''}
                            </p>
                        </div>
                        <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 border-l-4 border-black pl-3">仕様詳細</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium w-24">種類</th><td className="py-2 font-bold text-gray-900">{doorTypeName}</td></tr>
                                    {!isMaterial && (
                                        <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium">サイズ</th><td className="py-2 text-gray-900">W{config.width.toFixed(1)} × H{config.height}</td></tr>
                                    )}
                                    {isMaterial && (
                                        <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium">数量</th><td className="py-2 text-gray-900">{config.count || 1}{config.doorType === 'material-corner-skirting' ? '個' : '本'}</td></tr>
                                    )}
                                    <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium">カラー</th><td className="py-2 text-gray-900">{displayColor}</td></tr>
                                    {!isStorage && !isMaterial && <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium">枠種類</th><td className="py-2 text-gray-900">{frameTypeName}</td></tr>}
                                    {showHingeSide && <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium">{hingeLabel}</th><td className="py-2 text-gray-900">{hingeSideText}</td></tr>}
                                    {showHandle && <tr className="border-b"><th className="py-2 text-left text-gray-500 font-medium">ハンドル</th><td className="py-2 text-gray-900">{handleName}</td></tr>}
                                    <tr className="border-b">
                                        <th className="py-2 text-left text-gray-500 font-medium">ガラス</th>
                                        <td className={`py-2 ${config.glassStyle !== 'none' ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{glassName}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <th className="py-2 text-left text-gray-500 font-medium">錠</th>
                                        <td className={`py-2 ${config.lock === 'display-lock' ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{displayLock}</td>
                                    </tr>
                                    <tr><th className="py-2 text-left text-gray-500 font-medium">金額</th><td className="py-2 text-lg font-bold text-gray-900">¥{door.price.toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 border-l-4 border-black pl-3">寸法詳細 (mm)</h3>
                            {dimensions ? (
                                <table className="w-full text-sm bg-gray-50 rounded-lg overflow-hidden">
                                    <tbody>
                                        <tr className="border-b border-gray-200"><th className="py-2 px-3 text-left text-gray-500 font-medium w-24">枠外 W</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.frameOuterW}</td></tr>
                                        <tr className="border-b border-gray-200"><th className="py-2 px-3 text-left text-gray-500 font-medium">枠内 W</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.frameInnerW}</td></tr>
                                        <tr className="border-b border-gray-200"><th className="py-2 px-3 text-left text-gray-500 font-medium">ドア W</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.doorW}</td></tr>
                                        <tr className="border-b border-gray-200"><th className="py-2 px-3 text-left text-gray-500 font-medium">枠外 H</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.frameOuterH}</td></tr>
                                        <tr className="border-b border-gray-200"><th className="py-2 px-3 text-left text-gray-500 font-medium">枠内 H</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.frameInnerH}</td></tr>
                                        <tr className="border-b border-gray-200"><th className="py-2 px-3 text-left text-gray-500 font-medium">ドア H</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.doorH}</td></tr>
                                        {dimensions.railLength !== '-' && <tr><th className="py-2 px-3 text-left text-gray-500 font-medium">レール長</th><td className="py-2 px-3 font-mono text-gray-900">{dimensions.railLength}</td></tr>}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 text-sm">
                                    <p>寸法詳細情報はありません</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                         {detailDrawingUrl && (
                            <button
                                onClick={handleViewDrawing}
                                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                詳細図を見る
                            </button>
                         )}
                         <button 
                            onClick={handleClose}
                            className="bg-black text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-900 transition-all"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoorDetailModal;
