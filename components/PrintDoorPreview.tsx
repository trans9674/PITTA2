import React from 'react';
import { DoorConfiguration, ColorOption } from '../types';

const PrintDoorPreview: React.FC<{ config: DoorConfiguration, colors: ColorOption[] }> = ({ config, colors }) => {
  const color = colors.find(c => c.id === config.color);
  const showGlass = config.glassStyle !== 'none';
  const isSlidingDoor = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
  const isDoubleDoor = config.doorType === 'double';
  const isMultiPanelSliding = ['sliding-2', 'sliding-3', 'sliding-kata-2', 'sliding-kata-3', 'sliding-4'].includes(config.doorType);
  const isNewFoldingType = config.doorType.startsWith('folding-');
  const isStorage = config.doorType.startsWith('storage-');
  const isMaterial = config.doorType.startsWith('material-');
  const isLeverHandle = config.doorType === 'hinged';
  const isHingedStorage = config.doorType === 'hinged-storage';
  const hasDisplayLock = config.lock === 'display-lock';

  const panelBaseStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      height: '100%',
      backgroundColor: color ? color.hex : '#e5e7eb',
      backgroundImage: color?.textureUrl ? `url(${color.textureUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: '0.5px solid #000',
      boxSizing: 'border-box'
  };

  // Opening Direction Overlay
  const renderOverlay = () => {
    if (isStorage || isMaterial) return null;

    const stroke = "rgba(0,0,0, 0.6)";
    const strokeWidth = "0.8";
    const ah = 4; // arrow head size

    const mR = (x: number, y: number) => `M${x-ah},${y-ah/1.5} L${x},${y} L${x-ah},${y+ah/1.5}`;
    const mL = (x: number, y: number) => `M${x+ah},${y-ah/1.5} L${x},${y} L${x+ah},${y+ah/1.5}`;
    
    const content = [];

    // Define door boundaries in percentage (0-100) relative to the container
    let left = 0;
    let right = 100;

    if (config.doorType === 'hinged') {
        left = 25; right = 75; // 50% width, centered
    } else if (config.doorType === 'hinged-storage') {
        left = 37.5; right = 62.5; // 25% width, centered
    } else if (['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType)) {
        left = 25; right = 75; // 50% width, centered
    } else if (config.doorType === 'double') {
        left = 25; right = 75; // 50% width total, centered
    } else if (config.doorType === 'folding-2') {
        left = 25; right = 75; // 50% width, centered
    }

    if (['hinged', 'hinged-storage'].includes(config.doorType)) {
        if (config.hingeSide === 'left') {
            // Left Hinge (config) -> UI: Right Hinge
            content.push(<path key="h1" d={`M${left},0 L${right},50 L${left},100`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        } else {
            // Right Hinge (config) -> UI: Left Hinge
            content.push(<path key="h1" d={`M${right},0 L${left},50 L${right},100`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
    } else if (config.doorType === 'double') {
        content.push(<path key="d1" d={`M50,0 L${left},50 L50,100`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="d2" d={`M50,0 L${right},50 L50,100`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
    } else if (['sliding-inset', 'sliding-outset', 'sliding-single', 'sliding-hikikomi'].includes(config.doorType)) {
        const y = 50;
        const centerX = (left + right) / 2;
        const width = right - left;

        if (config.hingeSide === 'right') {
            // Handle Left, Opens Right (or Pocket Right)
            // Arrow points Right
            const endX = right + (width / 2);
            content.push(<line key="s1" x1={centerX} y1={y} x2={endX} y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key="s2" d={mR(endX, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        } else {
            // Handle Right, Opens Left (or Pocket Left)
            // Arrow points Left
            const endX = left - (width / 2);
            content.push(<line key="s1" x1={centerX} y1={y} x2={endX} y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key="s2" d={mL(endX, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
    } else if (['sliding-kata-2', 'sliding-kata-3'].includes(config.doorType)) {
        const y = 50;
        
        if (config.hingeSide === 'right') {
            // Right Hinge (config) = Stack Left (UI) -> Opens Right
            const startX = 25;
            const endX = 115; 
            content.push(<line key="sk1" x1={startX} y1={y} x2={endX} y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key="sk2" d={mR(endX, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        } else {
            // Left Hinge (config) = Stack Right (UI) -> Opens Left
            const startX = 75;
            const endX = -15;
            content.push(<line key="sk1" x1={startX} y1={y} x2={endX} y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key="sk2" d={mL(endX, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
    } else if (config.doorType === 'sliding-2') {
        const y = 50;
        content.push(<line key="s2" x1="25" y1={y} x2="75" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="s2l" d={mL(25, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="s2r" d={mR(75, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
    } else if (config.doorType === 'sliding-4') {
        const y = 50;
        content.push(<line key="sl1" x1="15" y1={y} x2="40" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="sl2l" d={mL(15, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="sl2r" d={mR(40, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        
        content.push(<line key="sr1" x1="60" y1={y} x2="85" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="sr2l" d={mL(60, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="sr2r" d={mR(85, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
    } else if (config.doorType === 'sliding-3') {
        const y = 50;
        content.push(<line key="s3l" x1="10" y1={y} x2="25" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="s3la" d={mR(25, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<line key="s3r" x1="90" y1={y} x2="75" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="s3ra" d={mL(75, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<line key="s3m" x1="42" y1={y} x2="58" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="s3mla" d={mL(42, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="s3mra" d={mR(58, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
    } else if (config.doorType === 'folding-2') {
        if (config.hingeSide === 'left') {
            content.push(<path key="f2h" d="M50,0 L75,50 L50,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key="f2o" d="M25,0 L50,50 L25,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        } else {
            content.push(<path key="f2h" d="M50,0 L25,50 L50,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key="f2o" d="M75,0 L50,50 L75,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
    } else if (config.doorType === 'folding-4') {
        content.push(<path key="f4_1" d="M0,50 L25,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_2" d="M0,50 L25,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_3" d="M25,50 L50,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_4" d="M25,50 L50,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_5" d="M100,50 L75,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_6" d="M100,50 L75,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_7" d="M75,50 L50,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f4_8" d="M75,50 L50,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
    } else if (config.doorType === 'folding-6') {
        const unit = 100 / 6;
        for (let i = 0; i < 4; i++) {
            const startX = i * unit;
            const endX = (i + 1) * unit;
            content.push(<path key={`f6_l_${i}_a`} d={`M${startX},50 L${endX},0`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key={`f6_l_${i}_b`} d={`M${startX},50 L${endX},100`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
        for (let i = 0; i < 2; i++) {
            const startX = 100 - (i * unit);
            const endX = 100 - ((i + 1) * unit);
            content.push(<path key={`f6_r_${i}_a`} d={`M${startX},50 L${endX},0`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
            content.push(<path key={`f6_r_${i}_b`} d={`M${startX},50 L${endX},100`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
    } else if (config.doorType === 'folding-8') {
        // Unit 1
        content.push(<path key="f8_1_1" d="M0,50 L12.5,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_2" d="M0,50 L12.5,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_3" d="M12.5,50 L25,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_4" d="M12.5,50 L25,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_5" d="M50,50 L37.5,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_6" d="M50,50 L37.5,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_7" d="M37.5,50 L25,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_1_8" d="M37.5,50 L25,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        // Unit 2
        content.push(<path key="f8_2_1" d="M50,50 L62.5,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_2" d="M50,50 L62.5,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_3" d="M62.5,50 L75,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_4" d="M62.5,50 L75,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_5" d="M100,50 L87.5,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_6" d="M100,50 L87.5,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_7" d="M87.5,50 L75,0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        content.push(<path key="f8_2_8" d="M87.5,50 L75,100" fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
    } else if (isNewFoldingType) {
        const y = 50;
        if (config.hingeSide === 'left') {
             content.push(<line key="f1" x1="80" y1={y} x2="20" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
             content.push(<path key="f2" d={mL(20, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        } else {
             content.push(<line key="f1" x1="20" y1={y} x2="80" y2={y} stroke={stroke} strokeWidth={strokeWidth} />);
             content.push(<path key="f2" d={mR(80, y)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />);
        }
    }

    if (content.length === 0) return null;

    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible" preserveAspectRatio="none">
            {content}
        </svg>
    );
  };

  // Helper to render vertical lines for storage
  const getStorageLines = () => {
      let numPanels = 2;
      if (config.width >= 200) numPanels = 5;
      else if (config.width >= 160) numPanels = 4;
      else if (config.width >= 120) numPanels = 3; // Changed from 4 to 3 for W120
      else numPanels = 2;
      
      const lines = [];
      for (let i = 1; i < numPanels; i++) {
          const leftPct = (i / numPanels) * 100;
          let style: React.CSSProperties = {
              position: 'absolute',
              left: `${leftPct}%`,
              width: '1.5px',
              backgroundColor: '#000',
              zIndex: 10,
              pointerEvents: 'none',
              top: 0,
              height: '100%'
          };
          
          // Dynamic split position
          let splitPct = 33.33;
          if (config.width === 160) splitPct = 50;
          if (config.width === 200) splitPct = 40;
          
          // If R-Type (Mirrored), flip the splitPct
          if (['storage-200-l', 'storage-200-u'].includes(config.doorType) && config.hingeSide === 'right') {
              splitPct = 100 - splitPct;
          }

          if (config.doorType === 'storage-200-l') {
              // L-Type: Low part on Right -> Lines > splitPct are low
              // R-Type: Low part on Left -> Lines < splitPct are low
              const isRType = config.hingeSide === 'right';
              
              if (isRType) {
                  if (leftPct < splitPct) {
                      style.bottom = 0;
                      style.height = '40%';
                      delete style.top;
                  } else {
                      style.top = 0;
                      style.height = '100%';
                  }
              } else {
                  if (leftPct < splitPct) {
                      style.top = 0;
                      style.height = '100%';
                  } else {
                      style.bottom = 0;
                      style.height = '40%';
                      delete style.top;
                  }
              }
          }
          if (config.doorType === 'storage-200-u') {
              // Similar logic but U type is Top/Bottom. Actually lines for U type go full height?
              // Wait, `storage-200-u` has a gap in middle.
              // 3D implementation splits it. 2D implementation should too?
              // Currently `getStorageLines` for `storage-200-u` does:
              // if (leftPct < splitPct) full height else full height.
              // Ah, the gap is handled by the divs, lines are just overlays.
              // But lines should probably not cross the gap if they fall in that area?
              // In current code:
              /*
              if (config.doorType === 'storage-200-u') {
                  if (leftPct < splitPct) {
                      style.top = 0;
                      style.height = '100%';
                  } else {
                      style.top = 0;
                      style.height = '100%'; 
                  }
              }
              */
             // It draws full lines over the gap. That's acceptable for schematic or lines should be broken?
             // Let's leave it simple as before unless requested.
          }
          lines.push(<div key={i} style={style}></div>);
      }
      return lines;
  };

  if (isStorage) {
    const baseStorageStyle: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: color ? color.hex : '#e5e7eb',
      backgroundImage: color?.textureUrl ? `url(${color.textureUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxSizing: 'border-box',
      border: '0.5px solid #000'
    };
    const storageLines = getStorageLines();
    
    // Calculate dynamic widths for split units
    let leftWidthPct = 33.33;
    let rightWidthPct = 66.66;
    if (config.width === 160) { leftWidthPct = 50; rightWidthPct = 50; }
    else if (config.width === 200) { leftWidthPct = 40; rightWidthPct = 60; }
    
    const isRType = ['storage-200-l', 'storage-200-u'].includes(config.doorType) && config.hingeSide === 'right';
    
    // Swap widths if R-Type?
    // L-Type: Left=Full(33%), Right=Low(66%)
    // R-Type: Left=Low(66%), Right=Full(33%)
    // So, left div width becomes rightWidthPct, right div width becomes leftWidthPct.
    
    const width1 = isRType ? rightWidthPct : leftWidthPct; // Left div
    const width2 = isRType ? leftWidthPct : rightWidthPct; // Right div
    
    const leftWidthStr = `${width1}%`;
    const rightWidthStr = `${width2}%`;

    switch (config.doorType) {
        case 'storage-80':
            return <div className="relative w-full h-full"><div style={{...baseStorageStyle, bottom: 0, height: '40%', width: '100%'}}>{storageLines}</div></div>;
        case 'storage-200-full':
            return <div className="relative w-full h-full"><div style={{...baseStorageStyle, top: 0, left: 0, width: '100%', height: '100%'}}>{storageLines}</div></div>;
        case 'storage-200-l':
            // L-Type: Left=Full, Right=Low
            // R-Type: Left=Low, Right=Full
            if (isRType) {
                return <div className="relative w-full h-full">
                    <div style={{...baseStorageStyle, left: 0, bottom: 0, width: leftWidthStr, height: '40%'}}></div>
                    <div style={{...baseStorageStyle, right: 0, top: 0, width: rightWidthStr, height: '100%', borderLeft: 'none'}}></div>
                    {storageLines}
                </div>;
            } else {
                return <div className="relative w-full h-full">
                    <div style={{...baseStorageStyle, left: 0, top: 0, width: leftWidthStr, height: '100%'}}></div>
                    <div style={{...baseStorageStyle, right: 0, bottom: 0, width: rightWidthStr, height: '40%', borderLeft: 'none'}}></div>
                    {storageLines}
                </div>;
            }
        case 'storage-200-u':
            // L-Type: Left=Full, Right=Split
            // R-Type: Left=Split, Right=Full
            if (isRType) {
                return (
                    <div className="relative w-full h-full">
                        <div style={{...baseStorageStyle, left: 0, top: 0, width: leftWidthStr, height: '30%'}}></div>
                        <div style={{...baseStorageStyle, left: 0, bottom: 0, width: leftWidthStr, height: '40%', borderTop: 'none'}}></div>
                        <div style={{...baseStorageStyle, right: 0, top: 0, width: rightWidthStr, height: '100%', borderLeft: 'none'}}></div>
                        {storageLines}
                    </div>
                );
            } else {
                return (
                    <div className="relative w-full h-full">
                        <div style={{...baseStorageStyle, left: 0, top: 0, width: leftWidthStr, height: '100%'}}></div>
                        <div style={{...baseStorageStyle, right: 0, top: 0, width: rightWidthStr, height: '30%', borderLeft: 'none'}}></div>
                        <div style={{...baseStorageStyle, right: 0, bottom: 0, width: rightWidthStr, height: '40%', borderLeft: 'none'}}></div>
                        {storageLines}
                    </div>
                );
            }
        case 'storage-separate':
             // Use consistent panel count logic for separate type
             let numPanels = 2;
             if (config.width >= 200) numPanels = 5;
             else if (config.width >= 160) numPanels = 4;
             else if (config.width >= 120) numPanels = 3;
             
             const linesT = [];
             const linesB = [];
             for (let i = 1; i < numPanels; i++) {
                 const leftPct = (i / numPanels) * 100;
                 const styleBase: React.CSSProperties = {
                    position: 'absolute', left: `${leftPct}%`, width: '1.5px', backgroundColor: '#000', zIndex: 10, pointerEvents: 'none'
                 };
                 linesT.push(<div key={`t${i}`} style={{...styleBase, top: 0, height: '100%'}}></div>);
                 linesB.push(<div key={`b${i}`} style={{...styleBase, top: 0, height: '100%'}}></div>);
             }
             
             return (
                <div className="relative w-full h-full">
                    <div style={{...baseStorageStyle, top: 0, left: 0, width: '100%', height: '30%'}}>{linesT}</div>
                    <div style={{...baseStorageStyle, bottom: 0, left: 0, width: '100%', height: '40%'}}>{linesB}</div>
                </div>
             );
        default: return <div className="relative w-full h-full bg-gray-300"></div>;
    }
  }

  const multiPanelContainerClasses = `relative w-full h-full rounded-sm overflow-hidden shadow-inner bg-gray-400`;

  if (isDoubleDoor) {
    const panels = [
        <div key="p1" style={{...panelBaseStyle, width: '50%', left: 0, borderRight: 'none' }}></div>,
        <div key="p2" style={{...panelBaseStyle, width: '50%', left: '50%', borderLeft: '1.5px solid #000'}}></div>
    ];
    const containerWidth = config.width === 120 ? '75%' : '50%';
    return <div className="relative w-full h-full flex items-center justify-center">{renderOverlay()}<div className="relative h-full" style={{ width: containerWidth }}><div className={multiPanelContainerClasses}>{panels}</div></div></div>;
  }

  if (isNewFoldingType) {
    let panelCount = 2;
    if (config.doorType === 'folding-4') panelCount = 4;
    if (config.doorType === 'folding-6') panelCount = 6;
    if (config.doorType === 'folding-8') panelCount = 8;
    const panels = [];
    for(let i=0; i < panelCount; i++) {
        const panelStyle: React.CSSProperties = {
            ...panelBaseStyle, 
            position: 'relative', 
            flex: 1, 
            width: 'auto', 
            left: 'auto',
            borderRight: i === panelCount - 1 ? '0.5px solid #000' : 'none',
        };
        if (i > 0) {
            panelStyle.borderLeft = '1.5px solid #000';
        }
        panels.push(<div key={i} style={panelStyle}></div>);
    }
    const isFolding2 = config.doorType === 'folding-2';
    const containerWidth = isFolding2 ? '50%' : '100%';
    return <div className={`relative w-full h-full ${isFolding2 ? 'flex justify-center' : ''}`}>{renderOverlay()}<div className={multiPanelContainerClasses} style={{ display: 'flex', width: containerWidth }}>{panels}</div></div>;
  }

  if (isMultiPanelSliding) {
      let panels: React.ReactNode[] = [];
      switch(config.doorType) {
          case 'sliding-2': panels = [<div key="p1" style={{...panelBaseStyle, width: '55%', left: 0, zIndex: 1 }}></div>, <div key="p2" style={{...panelBaseStyle, width: '55%', right: 0, zIndex: 2}}></div>]; break;
          case 'sliding-3': panels = [<div key="p1" style={{...panelBaseStyle, width: '35%', left: 0, zIndex: 1 }}></div>, <div key="p2" style={{...panelBaseStyle, width: '35%', left: '32.5%', zIndex: 2}}></div>, <div key="p3" style={{...panelBaseStyle, width: '35%', right: 0, zIndex: 3}}></div>]; break;
          case 'sliding-kata-2': panels = [<div key="p1" style={{...panelBaseStyle, width: '50%', left: 0, zIndex: 2 }}></div>, <div key="p2" style={{...panelBaseStyle, width: '50%', left: '50%', zIndex: 1}}></div>]; break;
          case 'sliding-kata-3': panels = [<div key="p1" style={{...panelBaseStyle, width: '33.33%', left: 0, zIndex: 1 }}></div>, <div key="p2" style={{...panelBaseStyle, width: '33.33%', left: '33.33%', zIndex: 2}}></div>, <div key="p3" style={{...panelBaseStyle, width: '33.33%', left: '66.66%', zIndex: 3}}></div>]; break;
          case 'sliding-4': panels = [<div key="p1" style={{...panelBaseStyle, width: '27.5%', left: '22.5%', zIndex: 1, borderRight: 'none'}}></div>, <div key="p2" style={{...panelBaseStyle, width: '27.5%', left: '50%', zIndex: 1}}></div>, <div key="p3" style={{...panelBaseStyle, width: '27.5%', left: 0, zIndex: 2}}></div>, <div key="p4" style={{...panelBaseStyle, width: '27.5%', right: 0, zIndex: 2}}></div>]; break;
      }
      return <div className="relative w-full h-full">{renderOverlay()}<div className={multiPanelContainerClasses}>{panels}</div></div>;
  }

  const handleSideStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${(1 - 100 / config.height) * 100}%`,
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px',
  };
  
  let positionRight = config.hingeSide === 'right';
  if (['sliding-inset', 'sliding-outset', 'sliding-kata-2', 'sliding-hikikomi'].includes(config.doorType)) {
      positionRight = !positionRight;
  }
  
  if (positionRight) { handleSideStyle.right = '8%'; handleSideStyle.alignItems = 'flex-end'; } 
  else { handleSideStyle.left = '8%'; handleSideStyle.alignItems = 'flex-start'; }

  let handleColor = color ? color.handleHex : '#1f2937';
  let handleBorder = 'none';
  if (isLeverHandle || isSlidingDoor || isMultiPanelSliding) {
    switch (config.handle) {
      case 'satin-nickel': handleColor = '#A0A0A0'; break;
      case 'white': handleColor = '#ffffff'; handleBorder = '1px solid #9ca3af'; break;
      case 'black': handleColor = '#1a1a1a'; break;
    }
  }
  
  const doorPanelStyle: React.CSSProperties = {
    backgroundColor: color ? color.hex : '#e5e7eb',
    backgroundImage: color?.textureUrl ? `url(${color.textureUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: isHingedStorage ? '25%' : (isLeverHandle || isSlidingDoor) ? '50%' : '100%',
    border: '0.5px solid #000',
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {renderOverlay()}
      <div 
        className="relative h-full flex items-center justify-center rounded-sm overflow-hidden shadow-inner"
        style={doorPanelStyle}
      >
        {showGlass && <div className="absolute w-[70%] h-[80%] bg-blue-200/50 border border-gray-400/30 rounded-sm"></div>}
        {!isHingedStorage && config.doorType !== 'folding-2' && (
        <div style={handleSideStyle}>
          {hasDisplayLock && (
              <div style={{ width: '6px', height: '6px', backgroundColor: '#d1d5db', borderRadius: '50%', border: '0.5px solid #9ca3af', marginBottom: '2px', position: 'relative', marginLeft: config.hingeSide === 'left' ? '1px' : '0', marginRight: config.hingeSide === 'right' ? '1px' : '0' }}>
                   <div style={{ width: '3px', height: '3px', backgroundColor: '#ef4444', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
              </div>
          )}
          {isLeverHandle ? (
            <div className="relative">
                <div style={{ width: '5px', height: '5px', backgroundColor: handleColor, border: handleBorder, borderRadius: '0.5px', position: 'relative', zIndex: 1 }}></div>
                <div style={{ width: '9px', height: '2.5px', backgroundColor: handleColor, border: handleBorder, borderRadius: '1px', position: 'absolute', top: '1.25px', left: config.hingeSide === 'left' ? '2.5px' : 'auto', right: config.hingeSide === 'right' ? '2.5px' : 'auto', zIndex: 2 }}></div>
            </div>
          ) : (
            <div style={{ width: '3px', height: '12px', backgroundColor: handleColor, border: handleBorder, borderRadius: '1px' }}></div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default PrintDoorPreview;