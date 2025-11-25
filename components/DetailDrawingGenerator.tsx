
import { SavedDoor, DoorOption, DoorTypeId, FrameTypeId, ColorOption, HandleId, GlassStyleId, LockId, DimensionSettings, ProjectInfo } from '../types';
import { getOptionName } from '../utils';

interface GeneratorProps {
  doors: SavedDoor[];
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  colors: ColorOption[];
  handles: DoorOption<HandleId>[];
  glassStyles: DoorOption<GlassStyleId>[];
  locks: DoorOption<LockId>[];
  dimensionSettings: DimensionSettings;
  projectInfo: ProjectInfo;
}

// Helper to safe calculate dimensions (Duplicated from DoorDetailModal to ensure standalone functionality)
const calculateDimension = (formula: string, w_mm: number, h_mm: number): string => {
    if (!formula) return '-';
    try {
        const expression = formula.toUpperCase()
            .replace(/W/g, w_mm.toString())
            .replace(/H/g, h_mm.toString());
        // Evaluation
        const result = new Function('return ' + expression)();
        // Round to 1 decimal place if needed
        return (Math.round(result * 10) / 10).toString();
    } catch (e) {
        return '-';
    }
};

// Helper to determine the dimension setting key (Duplicated logic)
const getDimensionKey = (config: any): string => {
    const type = config.doorType;
    const frame = config.frameType === 'threeWay' ? '3way' : '2way';
    
    if (type === 'hinged') return `hinged_${frame}`;
    if (type === 'hinged-storage') return `hinged_storage_${frame}`;
    if (type === 'double') return `double_${frame}`;
    
    // Sliding Types
    if (type === 'sliding-2') return `sliding_2_${frame}`;
    if (type === 'sliding-3') return `sliding_3_${frame}`;
    if (type === 'sliding-4') return `sliding_4_${frame}`;
    if (type === 'sliding-kata-2') return `sliding_kata_2_${frame}`;
    if (type === 'sliding-kata-3') return `sliding_kata_3_${frame}`;
    
    // Folding Types
    if (type === 'folding-2') return `folding_2_${frame}`;
    if (type === 'folding-4') return `folding_4_${frame}`;
    if (type === 'folding-6') return `folding_6_${frame}`;
    if (type === 'folding-8') return `folding_8_${frame}`;

    // Single Sliding (Outset / Inset)
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

export const generateBatchDetailDrawings = ({
  doors,
  doorTypes,
  frameTypes,
  colors,
  handles,
  glassStyles,
  locks,
  dimensionSettings,
  projectInfo
}: GeneratorProps) => {
    const pdfImageUrl = "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/linekitchen/hirakido.pdf&output=jpg&w=2400";
    const customerName = projectInfo.customerName || '未設定';
    const companyName = projectInfo.constructionCompany || '未設定';

    // Separate lists to calculate IDs correctly
    const wdList = doors.filter(d => !d.config.doorType.startsWith('storage-') && !d.config.doorType.startsWith('material-'));
    const sbList = doors.filter(d => d.config.doorType.startsWith('storage-'));

    // Generate pages
    let pagesHtml = '';
    let hasPages = false;

    // Process all doors in original order
    doors.forEach((door) => {
        const { config, roomName } = door;
        const isStorage = config.doorType.startsWith('storage-');
        const isMaterial = config.doorType.startsWith('material-');

        // Skip materials as they typically don't have this type of detail drawing
        if (isMaterial) return;

        const dimKey = getDimensionKey(config);
        const dimSetting = dimensionSettings[dimKey];

        // Skip if no dimension setting found (cannot generate drawing)
        if (!dimSetting) return;

        hasPages = true;

        // Calculate ID
        let idPrefix = 'WD';
        let index = 0;
        if (isStorage) {
            idPrefix = 'SB';
            index = sbList.findIndex(d => d.id === door.id);
        } else {
            idPrefix = 'WD';
            index = wdList.findIndex(d => d.id === door.id);
        }
        const wdNumber = `${idPrefix}${index + 1}`;

        // Option Names
        const doorTypeName = getOptionName(doorTypes, config.doorType);
        const colorName = getOptionName(colors, config.color);
        const frameTypeName = !isStorage ? getOptionName(frameTypes, config.frameType) : null;
        const showHandle = !['double', 'hinged-storage'].includes(config.doorType) && !config.doorType.startsWith('folding-') && !isStorage;
        const handleName = showHandle ? getOptionName(handles, config.handle) : null;
        const glassName = config.glassStyle !== 'none' ? getOptionName(glassStyles, config.glassStyle) : 'なし';
        const lockName = config.lock && config.lock !== 'none' ? getOptionName(locks, config.lock) : 'なし';

        // Hinge/Sliding Side Text
        const showHingeSide = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(config.doorType);
        const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
        const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(config.doorType);
        const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(config.doorType);
        
        let hingeSideText = '';
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

        // Dimensions
        const w_mm = config.width * 10;
        const h_mm = config.height * 10;
        const valFrameOuterW = calculateDimension(dimSetting.frameOuterW, w_mm, h_mm);
        const valFrameOuterH = calculateDimension(dimSetting.frameOuterH, w_mm, h_mm);
        const valFrameInnerW = calculateDimension(dimSetting.frameInnerW, w_mm, h_mm);
        const valFrameInnerH = calculateDimension(dimSetting.frameInnerH, w_mm, h_mm);
        const valDoorW = calculateDimension(dimSetting.doorW, w_mm, h_mm);
        const valDoorH = calculateDimension(dimSetting.doorH, w_mm, h_mm);
        const valRailLength = calculateDimension(dimSetting.railLength, w_mm, h_mm);

        pagesHtml += `
            <div class="page">
                <div class="wd-number">${wdNumber}</div>
                <div class="title-info-left">物件名　${customerName} 様邸</div>
                <div class="title-info-right">施工会社　${companyName} 御中</div>

                <div class="detail-panel">
                    <div class="table-group">
                        <h2>寸法詳細 (mm)</h2>
                        <table>
                            <tr><th>枠外 W</th><td>${valFrameOuterW}</td></tr>
                            <tr><th>枠内 W</th><td>${valFrameInnerW}</td></tr>
                            <tr><th>ドア W</th><td>${valDoorW}</td></tr>
                            <tr><th>枠外 H</th><td>${valFrameOuterH}</td></tr>
                            <tr><th>枠内 H</th><td>${valFrameInnerH}</td></tr>
                            <tr><th>ドア H</th><td>${valDoorH}</td></tr>
                            ${valRailLength !== '-' ? `<tr><th>レール長</th><td>${valRailLength}</td></tr>` : ''}
                        </table>
                    </div>
                    <div class="table-group">
                        <h2>仕様詳細</h2>
                        <table>
                            <tr><th>品番</th><td>${wdNumber} (${roomName || '名称なし'})</td></tr>
                            <tr><th>種類</th><td>${doorTypeName}</td></tr>
                            <tr><th>サイズ</th><td>W${config.width.toFixed(1)} × H${config.height}</td></tr>
                            <tr><th>枠</th><td>${frameTypeName || '-'}</td></tr>
                            <tr><th>カラー</th><td>${colorName}</td></tr>
                            <tr><th>${hingeLabel}</th><td>${hingeSideText || '-'}</td></tr>
                            ${showHandle ? `<tr><th>ハンドル</th><td>${handleName || '-'}</td></tr>` : ''}
                            ${glassName !== 'なし' ? `<tr><th>ガラス</th><td>${glassName}</td></tr>` : ''}
                            ${lockName !== 'なし' ? `<tr><th>錠</th><td>${lockName}</td></tr>` : ''}
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    if (!hasPages) {
        alert("出力できる詳細図がありません。");
        return;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('ポップアップがブロックされました。許可してください。');
        return;
    }

    const fullHtml = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title>詳細図一括出力</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A3 landscape; margin: 0; }
                body { 
                    margin: 0; 
                    padding: 0; 
                    font-family: 'Noto Sans JP', sans-serif; 
                    -webkit-print-color-adjust: exact;
                    background-color: #555; /* Dark background for preview */
                }
                .page {
                    position: relative;
                    width: 420mm; /* A3 Landscape Width */
                    height: 297mm; /* A3 Landscape Height */
                    background-image: url('${pdfImageUrl}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    background-color: white;
                    overflow: hidden;
                    margin: 0 auto 20px auto; /* Spacing for preview */
                    page-break-after: always;
                }
                .page:last-child {
                    page-break-after: auto;
                    margin-bottom: 0;
                }
                
                @media print {
                    body { background-color: white; }
                    .page { margin: 0; }
                    .print-btn { display: none; }
                }

                /* WD Number at Top Left */
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

                /* Title Block Info at Bottom */
                .title-info-left {
                    position: absolute;
                    bottom: 13mm;
                    left: 45mm;
                    font-size: 18px;
                    font-weight: bold;
                    background-color: transparent;
                    padding: 2px 5px;
                }
                .title-info-right {
                    position: absolute;
                    bottom: 13mm;
                    left: 250mm;
                    font-size: 18px;
                    font-weight: bold;
                    background-color: transparent;
                    padding: 2px 5px;
                }

                /* Combined Info Panel - Vertical Stack */
                .detail-panel {
                    position: absolute;
                    bottom: 40mm;
                    left: 20mm;
                    width: 450px;
                    background: white;
                    border: 3px solid #333;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
                    z-index: 10;
                    display: block;
                    transform: scale(0.8);
                    transform-origin: bottom left;
                }
                .table-group {
                    width: 100%;
                    margin-bottom: 20px;
                }
                .table-group:last-child {
                    margin-bottom: 0;
                }
                h2 {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                    font-weight: bold;
                    border-bottom: 2px solid #333;
                    padding-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                th, td {
                    border: 1px solid #999;
                    padding: 6px 10px;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    text-align: left;
                    width: 40%;
                }
                td {
                    text-align: center;
                    font-weight: bold;
                }
                
                .print-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: black;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    z-index: 100;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                }
            </style>
        </head>
        <body>
            <button class="print-btn" onclick="window.print()">印刷する (PDF保存)</button>
            ${pagesHtml}
        </body>
        </html>
    `;

    newWindow.document.write(fullHtml);
    newWindow.document.close();
};
