
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ColorOption, DoorConfiguration, DoorOption, DoorTypeId, FrameTypeId, GlassStyleId } from '../types';

// 3Dモデルの定数
const DOOR_THICKNESS = 0.05;
const FRAME_THICKNESS = 0.008;
const FRAME_DEPTH = 0.1;
const SCALE = 0.01; // cmをモデル用のメートルに変換

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous'); // Enable CORS to prevent black textures

const getOptionName = <T extends string>(options: DoorOption<T>[], id: T): string => {
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


// クラシックハンドルを作成するヘルパー関数
const createClassicHandle = (material: THREE.Material): THREE.Group => {
    const handleGroup = new THREE.Group();

    // 1. 台座 (Backplate) 4.2cm x 4.2cm, 厚み 2mm (少し小さく修正)
    const plateSize = 0.042;
    const plateThickness = 0.002;
    const plateGeom = new THREE.BoxGeometry(plateSize, plateSize, plateThickness);
    const plateMesh = new THREE.Mesh(plateGeom, material);
    // 台座をグループの原点に配置
    handleGroup.add(plateMesh);

    // 2. ハンドル (Lever) 1.5cm角 x 10cm長さ
    const leverSize = 0.015;
    const leverLength = 0.10;
    const leverGeom = new THREE.BoxGeometry(leverLength, leverSize, leverSize);
    const leverMesh = new THREE.Mesh(leverGeom, material);
    
    // ハンドルを台座の前面から生えるように配置
    // X: レバーの根元が台座の中心から出るように、中心を長さの半分だけずらす
    leverMesh.position.x = leverLength / 2;
    // Z: 台座の表面 (z = plateThickness / 2) から生えるように配置
    leverMesh.position.z = plateThickness / 2 + leverSize / 2;
    
    handleGroup.add(leverMesh);
    
    return handleGroup;
};

interface DoorPreviewProps {
  config: DoorConfiguration;
  colors: ColorOption[];
  doorTypes: DoorOption<DoorTypeId>[];
  frameTypes: DoorOption<FrameTypeId>[];
  glassStyles: DoorOption<GlassStyleId>[];
}

const DoorPreview: React.FC<DoorPreviewProps> = ({ config, colors, doorTypes, frameTypes, glassStyles }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Animation and interaction refs
  const doorPivotsRef = useRef<THREE.Group[]>([]);
  const clickablePanelsRef = useRef<THREE.Mesh[]>([]);
  const isDoorOpenRef = useRef(false);


  // 設定に基づいてドアのグループを作成する関数
  const createDoorGroup = (currentConfig: DoorConfiguration): THREE.Group => {
      // Clear refs for new door
      doorPivotsRef.current = [];
      clickablePanelsRef.current = [];

      if (currentConfig.doorType === 'unselected') {
          return new THREE.Group();
      }

      const group = new THREE.Group();
      const colorInfo = colors.find(c => c.id === currentConfig.color);

      let doorMaterial: THREE.MeshStandardMaterial;
      
      if (colorInfo?.textureUrl) {
          const texture = textureLoader.load(colorInfo.textureUrl);
          texture.colorSpace = THREE.SRGBColorSpace;
          
          doorMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              color: 0xffffff,
              roughness: 0.8,
              metalness: 0.05
          });
      } else {
          doorMaterial = new THREE.MeshStandardMaterial({
              color: colorInfo ? new THREE.Color(colorInfo.hex) : new THREE.Color(0xffffff),
              roughness: colorInfo?.category === 'wood' ? 0.9 : 0.8,
              metalness: colorInfo?.category === 'wood' ? 0.05 : 0.2,
          });
      }

      const frameMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xffffff), // Always white
          roughness: 0.8,
          metalness: 0.2,
      });

      const handleMaterial = new THREE.MeshStandardMaterial({
          color: colorInfo ? new THREE.Color(colorInfo.handleHex) : new THREE.Color(0x888888),
          roughness: 0.4,
          metalness: 0.8,
      });

      const createMeshWithTexture = (geometry: THREE.BufferGeometry, material: THREE.MeshStandardMaterial, width: number, height: number, rotateTexture: boolean = false) => {
        if (colorInfo?.textureUrl && material.map) {
             const m = material.clone();
             m.map = material.map.clone();
             m.map.colorSpace = THREE.SRGBColorSpace;
             
             const repeatX = Math.max(1, width * 2);
             const repeatY = Math.max(1, height * 2);
             
             if (rotateTexture) {
                m.map.center.set(0.5, 0.5);
                m.map.rotation = Math.PI / 2;
                m.map.repeat.set(repeatY, repeatX); // Swap repeats because axis are swapped
             } else {
                m.map.repeat.set(repeatX, repeatY);
             }

             m.map.wrapS = THREE.RepeatWrapping;
             m.map.wrapT = THREE.RepeatWrapping;
             
             return new THREE.Mesh(geometry, m);
        }
        return new THREE.Mesh(geometry, material);
      };

      if (currentConfig.doorType.startsWith('material-')) {
          // Simple representation for materials
          // SCALE UP by 300% (multiply by 3) for visibility as requested
          const MAT_SCALE = SCALE * 3; 

          const isSkirting = currentConfig.doorType === 'material-skirting';
          const isCorner = currentConfig.doorType === 'material-corner-skirting';
          
          if (isCorner) {
              // L-shaped corner skirting
              // Leg 1: 10cm x 6cm x 1cm (scaled)
              const legLength = 10 * MAT_SCALE;
              const height = 6 * MAT_SCALE;
              const thickness = 1 * MAT_SCALE;
              
              const leg1Geom = new THREE.BoxGeometry(legLength, height, thickness);
              const leg1Mesh = createMeshWithTexture(leg1Geom, doorMaterial, legLength, height);
              
              const leg2Geom = new THREE.BoxGeometry(thickness, height, legLength);
              const leg2Mesh = createMeshWithTexture(leg2Geom, doorMaterial, thickness, height);
              
              // Align to form corner
              leg1Mesh.position.set(-legLength / 2 + thickness / 2, height / 2, 0);
              leg2Mesh.position.set(0, height / 2, legLength / 2 - thickness / 2);
              
              group.add(leg1Mesh);
              group.add(leg2Mesh);
              
              // Center roughly
              group.position.x = legLength / 4;
              group.position.z = -legLength / 4;
          } else {
              // Standard straight board
              const boardLength = 200 * MAT_SCALE; // 2m length
              const boardHeight = isSkirting ? 6 * MAT_SCALE : 2 * MAT_SCALE; // 6cm for skirting, 2cm for sill (thickness in y)
              const boardDepth = isSkirting ? 1 * MAT_SCALE : 15 * MAT_SCALE; // 1cm thick for skirting, 15cm deep for sill
              
              const geometry = new THREE.BoxGeometry(boardLength, boardHeight, boardDepth);
              const mesh = createMeshWithTexture(geometry, doorMaterial, boardLength, boardHeight);
              
              // Center it
              mesh.position.y = boardHeight / 2;
              group.add(mesh);
          }
          return group;
      }

      const openingWidth = currentConfig.width * SCALE;
      // Use the exact configured width for all sliding doors, removing any artificial multipliers.
      // This ensures 340cm renders as 340cm, not 680cm or 476cm.
      // This effectively scales down "sliding-4" by 50% (from previous *2 to *1) and "sliding-kata-3" by ~33% (from *1.5 to *1).
      let doorWidth = openingWidth;

      // Apply 75% scaling for sliding-kata-2 and sliding-kata-3 as requested
      if (['sliding-kata-2', 'sliding-kata-3'].includes(currentConfig.doorType)) {
          doorWidth = openingWidth * 0.75;
      }
      
      const doorHeight = currentConfig.height * SCALE;
      
      // Determine thickness: 25mm for hinged, double, and folding; 50mm for others (sliding)
      const isThinDoor = ['hinged', 'hinged-storage', 'double'].includes(currentConfig.doorType) || currentConfig.doorType.startsWith('folding-');
      const currentDoorThickness = isThinDoor ? 0.025 : DOOR_THICKNESS;

      const isNewSlidingType = currentConfig.doorType.startsWith('sliding-'); // Legacy check
      const isSingleSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(currentConfig.doorType);
      const isMultiPanelSliding = ['sliding-2', 'sliding-3', 'sliding-kata-2', 'sliding-kata-3', 'sliding-4'].includes(currentConfig.doorType);
      const isNewFoldingType = currentConfig.doorType.startsWith('folding-');
      const isStorageType = currentConfig.doorType.startsWith('storage-');

      const createPanel = (width: number, height: number, withGlass: boolean, withHandle: boolean, handleSide: 'left' | 'right' = 'right', handleXOffsetCm: number = 0) => {
          const panelGroup = new THREE.Group();
          const isOutlined = ['double'].includes(currentConfig.doorType) || currentConfig.doorType.startsWith('folding-');
          const outlineMaterial = isOutlined ? new THREE.LineBasicMaterial({ color: 0x999999 }) : null;
          
          if (withGlass && currentConfig.glassStyle !== 'none') {
            // --- Create a door with a window (frame and glass) ---
            const frameMargin = 15 * SCALE; // 15cm margin

            // Glass
            const glassWidth = Math.max(0.1, width - (frameMargin * 2));
            const glassHeight = Math.max(0.1, height - (frameMargin * 2));
            const glassGeom = new THREE.BoxGeometry(glassWidth, glassHeight, currentDoorThickness * 0.5); // Make glass thinner
            const glassMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transmission: 1.0,
                roughness: currentConfig.glassStyle === 'frosted' ? 0.5 : 0.1,
                thickness: 0.01,
                ior: 1.5,
                transparent: true,
            });
            const glassMesh = new THREE.Mesh(glassGeom, glassMaterial);
            panelGroup.add(glassMesh);

            // Frame components
            const topFrameHeight = frameMargin;
            const bottomFrameHeight = frameMargin;
            const sideFrameWidth = frameMargin;

            // Top frame
            const topFrameGeom = new THREE.BoxGeometry(width, topFrameHeight, currentDoorThickness);
            const topFrameMesh = createMeshWithTexture(topFrameGeom, doorMaterial, width, topFrameHeight);
            topFrameMesh.position.y = (height / 2) - (topFrameHeight / 2);
            panelGroup.add(topFrameMesh);
            if (isOutlined && outlineMaterial) {
                const edges = new THREE.EdgesGeometry(topFrameGeom);
                const line = new THREE.LineSegments(edges, outlineMaterial);
                line.position.y = topFrameMesh.position.y;
                panelGroup.add(line);
            }

            // Bottom frame
            const bottomFrameGeom = new THREE.BoxGeometry(width, bottomFrameHeight, currentDoorThickness);
            const bottomFrameMesh = createMeshWithTexture(bottomFrameGeom, doorMaterial, width, bottomFrameHeight);
            bottomFrameMesh.position.y = -(height / 2) + (bottomFrameHeight / 2);
            panelGroup.add(bottomFrameMesh);
            if (isOutlined && outlineMaterial) {
                const edges = new THREE.EdgesGeometry(bottomFrameGeom);
                const line = new THREE.LineSegments(edges, outlineMaterial);
                line.position.y = bottomFrameMesh.position.y;
                panelGroup.add(line);
            }

            // Left frame
            const sideFrameHeight = height - topFrameHeight - bottomFrameHeight;
            const leftFrameGeom = new THREE.BoxGeometry(sideFrameWidth, sideFrameHeight, currentDoorThickness);
            const leftFrameMesh = createMeshWithTexture(leftFrameGeom, doorMaterial, sideFrameWidth, sideFrameHeight);
            leftFrameMesh.position.x = -(width / 2) + (sideFrameWidth / 2);
            panelGroup.add(leftFrameMesh);
            if (isOutlined && outlineMaterial) {
                const edges = new THREE.EdgesGeometry(leftFrameGeom);
                const line = new THREE.LineSegments(edges, outlineMaterial);
                line.position.x = leftFrameMesh.position.x;
                panelGroup.add(line);
            }

            // Right frame
            const rightFrameGeom = new THREE.BoxGeometry(sideFrameWidth, sideFrameHeight, currentDoorThickness);
            const rightFrameMesh = createMeshWithTexture(rightFrameGeom, doorMaterial, sideFrameWidth, sideFrameHeight);
            rightFrameMesh.position.x = (width / 2) - (sideFrameWidth / 2);
            panelGroup.add(rightFrameMesh);
            if (isOutlined && outlineMaterial) {
                const edges = new THREE.EdgesGeometry(rightFrameGeom);
                const line = new THREE.LineSegments(edges, outlineMaterial);
                line.position.x = rightFrameMesh.position.x;
                panelGroup.add(line);
            }

            // Add all frame parts to clickable ref
            clickablePanelsRef.current.push(topFrameMesh, bottomFrameMesh, leftFrameMesh, rightFrameMesh);

          } else {
              // --- Create a solid door panel ---
              const panelGeom = new THREE.BoxGeometry(width, height, currentDoorThickness);
              const panelMesh = createMeshWithTexture(panelGeom, doorMaterial, width, height);
              panelGroup.add(panelMesh);
              clickablePanelsRef.current.push(panelMesh); // Make panel clickable
              if (isOutlined && outlineMaterial) {
                  const edges = new THREE.EdgesGeometry(panelGeom);
                  const line = new THREE.LineSegments(edges, outlineMaterial);
                  panelGroup.add(line);
              }
          }

          if (withHandle && !isNewFoldingType && !isStorageType) {
              // ハンドルの高さ位置を100cm (1m) に設定
              const handleY = (100 * SCALE) - (doorHeight / 2);
              
              const needsTwoHandles = ['hinged', 'hinged-storage', 'double'].includes(currentConfig.doorType);
              
              // Handle material selection
              let specificHandleMaterial: THREE.MeshStandardMaterial;
              switch (currentConfig.handle) {
                  case 'satin-nickel':
                      specificHandleMaterial = new THREE.MeshStandardMaterial({
                          color: 0xA0A0A0, // Darker silver for better visibility
                          metalness: 0.6,
                          roughness: 0.2
                      });
                      break;
                  case 'white':
                      specificHandleMaterial = new THREE.MeshStandardMaterial({
                          color: 0xffffff,
                          metalness: 0.1,
                          roughness: 0.7
                      });
                      break;
                  case 'black':
                      specificHandleMaterial = new THREE.MeshStandardMaterial({
                          color: 0x1a1a1a,
                          metalness: 0.1,
                          roughness: 0.9
                      });
                      break;
                  default:
                      // Fallback to the default handle material
                      specificHandleMaterial = handleMaterial.clone();
              }
      
              if (currentConfig.doorType === 'double') {
                  // 両開き戸専用ハンドル
                  const handleGeom = new THREE.BoxGeometry(0.07, 0.01, 0.01); // w, h, d
                  const handleMesh = new THREE.Mesh(handleGeom, handleMaterial);
                  
                  const handleX = (width / 2) - (5 * SCALE); // 5cm from the edge
                  const handlePositionX = (handleSide === 'right') ? handleX : -handleX;
                  
                  // Position it on the door surface.
                  handleMesh.position.set(handlePositionX, handleY, currentDoorThickness / 2 + 0.01 / 2);
                  panelGroup.add(handleMesh);
      
                  // Add handle to the back side as well
                  const backHandleMesh = handleMesh.clone();
                  backHandleMesh.position.z = -(currentDoorThickness / 2 + 0.01 / 2);
                  panelGroup.add(backHandleMesh);
              } else {
                  // --- Existing handle logic for all other door types ---
                  const handleX = (width / 2) - (6 * SCALE);
                  
                  if (isSingleSliding || isMultiPanelSliding) {
                      // 引き戸専用のハンドル (W3cm H10cm の四角)
                      const handleWidth = 3 * SCALE;
                      const handleHeight = 10 * SCALE;
                      const handleDepth = 0.01; // 1cm thick
                      const handleGeom = new THREE.BoxGeometry(handleWidth, handleHeight, handleDepth);
                      
                      const handleMesh = new THREE.Mesh(handleGeom, specificHandleMaterial);
                      
                      const handlePositionX = ((handleSide === 'right') ? handleX : -handleX) + (handleXOffsetCm * SCALE);
                      // Place it on the door surface
                      handleMesh.position.set(handlePositionX, handleY, currentDoorThickness / 2 + handleDepth / 2);
                      panelGroup.add(handleMesh);
      
                      // Add handle to the back side as well
                      const backHandleMesh = handleMesh.clone();
                      backHandleMesh.position.z = -(currentDoorThickness / 2 + handleDepth / 2);
                      panelGroup.add(backHandleMesh);
                      
                      // --- Display Lock Logic for Sliding Door ---
                      if (currentConfig.lock === 'display-lock' && isSingleSliding) {
                          const lockSize = 2.5 * SCALE; // 2.5cm
                          const lockDepth = 0.005;
                          // Cylinder for round lock
                          const lockGeom = new THREE.CylinderGeometry(lockSize/2, lockSize/2, lockDepth, 32);
                          const lockMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5 });
                          const lockMesh = new THREE.Mesh(lockGeom, lockMat);
                          lockMesh.rotation.x = Math.PI / 2;
                          
                          // Place lock slightly above the handle
                          const lockY = handleY + (handleHeight / 2) + (3 * SCALE);
                          lockMesh.position.set(handlePositionX, lockY, currentDoorThickness / 2 + lockDepth / 2);
                          
                          // Indicator (Red)
                          const indGeom = new THREE.CylinderGeometry(lockSize/4, lockSize/4, lockDepth + 0.001, 16);
                          const indMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
                          const indMesh = new THREE.Mesh(indGeom, indMat);
                          indMesh.rotation.x = Math.PI / 2;
                          indMesh.position.set(handlePositionX, lockY, currentDoorThickness / 2 + lockDepth / 2 + 0.001);

                          panelGroup.add(lockMesh);
                          panelGroup.add(indMesh);
                      }

                  } else {
                      const handleXPosition = (handleSide === 'right') ? handleX : -handleX;
                      
                      const frontHandle = createClassicHandle(specificHandleMaterial);
                      frontHandle.position.set(handleXPosition, handleY, currentDoorThickness / 2);
                      
                      // To point the handle inward:
                      // If on the left side, do nothing (lever model points +X).
                      // If on the right side, flip it on its X-axis to point -X.
                      if (handleSide === 'right') {
                        frontHandle.scale.x = -1;
                      }
                      panelGroup.add(frontHandle);
      
                      if (needsTwoHandles) {
                          const backHandle = createClassicHandle(specificHandleMaterial);
                          backHandle.position.set(handleXPosition, handleY, -currentDoorThickness / 2);
                          if (handleSide === 'right') {
                            backHandle.scale.x = -1; // Apply the same flip
                          }
                          backHandle.scale.z = -1; // Mirror the handle to face outwards
                          panelGroup.add(backHandle);
                      }
                      
                      // --- Display Lock Logic for Hinged Door ---
                      if (currentConfig.lock === 'display-lock' && currentConfig.doorType === 'hinged') {
                           const lockSize = 3.0 * SCALE; // 3cm diameter
                           const lockDepth = 0.003; // Thin plate
                           
                           // Use Cylinder for Round Lock (Display Lock style)
                           const lockGeom = new THREE.CylinderGeometry(lockSize/2, lockSize/2, lockDepth, 32);
                           const lockMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.3 });
                           
                           // Front Lock
                           const lockMesh = new THREE.Mesh(lockGeom, lockMat);
                           lockMesh.rotation.x = Math.PI / 2;

                           // Place lock above handle
                           const lockY = handleY + (6 * SCALE); // 6cm above handle center
                           lockMesh.position.set(handleXPosition, lockY, currentDoorThickness / 2 + lockDepth/2);
                           
                           // Indicator window (Red dot)
                           const indSize = 0.8 * SCALE;
                           const indGeom = new THREE.CylinderGeometry(indSize/2, indSize/2, lockDepth + 0.001, 16);
                           const indMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
                           const indMesh = new THREE.Mesh(indGeom, indMat);
                           
                           // Add indicator directly to panel (simpler positioning than nesting in rotated parent)
                           indMesh.rotation.x = Math.PI / 2;
                           indMesh.position.set(handleXPosition, lockY, currentDoorThickness / 2 + lockDepth/2 + 0.001);
                           
                           panelGroup.add(lockMesh);
                           panelGroup.add(indMesh);

                           // Back Lock
                           const backLockMesh = lockMesh.clone();
                           backLockMesh.rotation.x = -Math.PI / 2; // Face -Z
                           backLockMesh.position.set(handleXPosition, lockY, -(currentDoorThickness / 2 + lockDepth/2));
                           
                           const backIndMesh = indMesh.clone();
                           backIndMesh.rotation.x = -Math.PI / 2; // Face -Z
                           backIndMesh.position.set(handleXPosition, lockY, -(currentDoorThickness / 2 + lockDepth/2 + 0.001));

                           panelGroup.add(backLockMesh);
                           panelGroup.add(backIndMesh);
                      }
                  }
              }
          }
          return panelGroup;
      };

      const canHaveGlass = ['hinged', 'sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(currentConfig.doorType);

      switch(currentConfig.doorType) {
          case 'hinged':
          case 'hinged-storage': {
              const handleSide = currentConfig.hingeSide === 'right' ? 'left' : 'right';
              // hinged-storage does not show handle
              const withHandle = currentConfig.doorType !== 'hinged-storage';
              const panel = createPanel(doorWidth, doorHeight, canHaveGlass, withHandle, handleSide);
              const pivot = new THREE.Group();
              
              const pivotX = currentConfig.hingeSide === 'right' ? doorWidth / 2 : -doorWidth / 2;
              pivot.position.x = pivotX;
              panel.position.x = -pivotX;
              
              // 枠より3cm手前に配置（回転180度のため、ローカル座標で-0.03）
              pivot.position.z = -0.03;

              pivot.userData.rotationDirection = currentConfig.hingeSide === 'right' ? -1 : 1;
              
              pivot.add(panel);
              group.add(pivot);
              doorPivotsRef.current.push(pivot);
              break;
          }
          case 'double': {
              const panelWidth = doorWidth / 2;
              
              // Left Panel
              const leftPanel = createPanel(panelWidth, doorHeight, canHaveGlass, false, 'right');
              const leftPivot = new THREE.Group();
              leftPivot.position.x = -doorWidth / 2;
              
              // 枠より3cm手前に配置（回転180度のため、ローカル座標で-0.03）
              leftPivot.position.z = -0.03;
              
              leftPanel.position.x = panelWidth / 2;
              leftPivot.userData.rotationDirection = 1;
              leftPivot.add(leftPanel);
              group.add(leftPivot);
              doorPivotsRef.current.push(leftPivot);
              
              // Right Panel
              const rightPanel = createPanel(panelWidth, doorHeight, canHaveGlass, false, 'left');
              const rightPivot = new THREE.Group();
              rightPivot.position.x = doorWidth / 2;
              
              // 枠より3cm手前に配置（回転180度のため、ローカル座標で-0.03）
              rightPivot.position.z = -0.03;
              
              rightPanel.position.x = -panelWidth / 2;
              rightPivot.userData.rotationDirection = -1;
              rightPivot.add(rightPanel);
              group.add(rightPivot);
              doorPivotsRef.current.push(rightPivot);
              break;
          }
          case 'storage-80':
          case 'storage-200-full': {
              const storageWidth = currentConfig.width * SCALE;
              const storageHeight = currentConfig.height * SCALE;
              const storageDepth = 40 * SCALE;

              // Main cabinet box
              const boxGeom = new THREE.BoxGeometry(storageWidth, storageHeight, storageDepth);
              const boxMesh = createMeshWithTexture(boxGeom, doorMaterial, storageWidth, storageHeight);
              group.add(boxMesh);

              // NEW: Counter for storage-80 (Floor type) with 3mm gap
              if (currentConfig.doorType === 'storage-80') {
                  const counterGeom = new THREE.BoxGeometry(storageWidth, 0.02, storageDepth); // 2cm thickness
                  const counterMesh = createMeshWithTexture(counterGeom, doorMaterial, storageWidth, storageDepth, true);
                  // Place on top of the box with 3mm gap
                  counterMesh.position.y = (storageHeight / 2) + 0.003 + (0.02 / 2);
                  group.add(counterMesh);
              }

              // Add vertical lines based on width
              let numPanels;
              if (currentConfig.width <= 90) {
                  numPanels = 2;
              } else if (currentConfig.width === 120) {
                  // W120 is 3 panels for floor and tall types
                  numPanels = 3;
              } else if (currentConfig.width <= 160) {
                  numPanels = 4;
              } else {
                  numPanels = 5;
              }
              
              if (numPanels > 1) {
                  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
                  const panelWidth = storageWidth / numPanels;
                  const lineDepth = 0.001;
                  const lineWidth = 0.002;
                  for (let i = 1; i < numPanels; i++) {
                      const lineGeom = new THREE.BoxGeometry(lineWidth, storageHeight, lineDepth);
                      const lineMesh = new THREE.Mesh(lineGeom, lineMaterial);
                      lineMesh.position.x = -storageWidth / 2 + panelWidth * i;
                      lineMesh.position.z = storageDepth / 2 + lineDepth / 2; // Position on the very front
                      group.add(lineMesh);
                  }
              }
              break;
          }
          case 'storage-separate': {
              const storageWidth = currentConfig.width * SCALE;
              const storageDepth = 40 * SCALE;
              
              // Bottom part (height 90cm)
              const bottomHeight = 90 * SCALE;
              const bottomGeom = new THREE.BoxGeometry(storageWidth, bottomHeight, storageDepth);
              const bottomMesh = createMeshWithTexture(bottomGeom, doorMaterial, storageWidth, bottomHeight);
              const totalH = 220 * SCALE;
              
              bottomMesh.position.y = (-totalH / 2) + (bottomHeight / 2);
              group.add(bottomMesh);

              // NEW: Counter on bottom unit with 3mm gap
              const counterGeom = new THREE.BoxGeometry(storageWidth, 0.02, storageDepth);
              const counterMesh = createMeshWithTexture(counterGeom, doorMaterial, storageWidth, storageDepth, true);
              counterMesh.position.y = bottomMesh.position.y + (bottomHeight / 2) + 0.003 + (0.02 / 2);
              group.add(counterMesh);
              
              // Top part
              const topHeight = 60 * SCALE;
              const topGeom = new THREE.BoxGeometry(storageWidth, topHeight, storageDepth);
              const topMesh = createMeshWithTexture(topGeom, doorMaterial, storageWidth, topHeight);
              topMesh.position.y = (totalH / 2) - (topHeight / 2);
              group.add(topMesh);
              
              // Vertical lines for bottom unit
              let numPanels;
              if (currentConfig.width <= 90) { numPanels = 2; } 
              else if (currentConfig.width === 120) { numPanels = 3; }
              else if (currentConfig.width <= 160) { numPanels = 4; } 
              else { numPanels = 5; }

              if (numPanels > 1) {
                  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
                  const panelWidth = storageWidth / numPanels;
                  const lineDepth = 0.001;
                  const lineWidth = 0.002;
                  for (let i = 1; i < numPanels; i++) {
                      // Bottom lines
                      const lineGeomB = new THREE.BoxGeometry(lineWidth, bottomHeight, lineDepth);
                      const lineMeshB = new THREE.Mesh(lineGeomB, lineMaterial);
                      lineMeshB.position.x = -storageWidth / 2 + panelWidth * i;
                      lineMeshB.position.y = bottomMesh.position.y;
                      lineMeshB.position.z = storageDepth / 2 + lineDepth / 2;
                      group.add(lineMeshB);
                      
                      // Top lines
                      const lineGeomT = new THREE.BoxGeometry(lineWidth, topHeight, lineDepth);
                      const lineMeshT = new THREE.Mesh(lineGeomT, lineMaterial);
                      lineMeshT.position.x = -storageWidth / 2 + panelWidth * i;
                      lineMeshT.position.y = topMesh.position.y;
                      lineMeshT.position.z = storageDepth / 2 + lineDepth / 2;
                      group.add(lineMeshT);
                  }
              }
              break;
          }
          case 'storage-200-l': {
            const storageWidth = currentConfig.width * SCALE;
            const storageDepth = 40 * SCALE;
            const isRType = currentConfig.hingeSide === 'right'; // Default is Left (L-Type). Right is R-Type (Mirrored).
            const mirrorX = (x: number) => isRType ? -x : x;
            
            // L-shape consists of a full height part and a lower part
            // Logic depends on total Width
            let fullHeightPartWidth, lowPartWidth;
            let fullPartPanels = 1, lowPartPanels = 2; // Default for small/medium

            if (currentConfig.width === 160) {
                // W160: High 80cm (2 panels), Low 80cm (2 panels)
                fullHeightPartWidth = 80 * SCALE;
                lowPartWidth = 80 * SCALE;
                fullPartPanels = 2;
                lowPartPanels = 2;
            } else if (currentConfig.width === 200) {
                // W200: High 80cm (2 panels), Low 120cm (3 panels)
                fullHeightPartWidth = 80 * SCALE;
                lowPartWidth = 120 * SCALE;
                fullPartPanels = 2;
                lowPartPanels = 3;
            } else {
                // Default (e.g. custom) fallback: 1/3 and 2/3
                fullHeightPartWidth = storageWidth / 3;
                lowPartWidth = storageWidth * 2 / 3;
            }

            // Full height part (Left side for L-Type)
            const fullHeightGeom = new THREE.BoxGeometry(fullHeightPartWidth, 200 * SCALE, storageDepth);
            const fullHeightMesh = createMeshWithTexture(fullHeightGeom, doorMaterial, fullHeightPartWidth, 200 * SCALE);
            // Center of full height part relative to 0
            fullHeightMesh.position.x = mirrorX((-storageWidth / 2) + (fullHeightPartWidth / 2));
            group.add(fullHeightMesh);

            // Low part (Right side for L-Type)
            const lowPartGeom = new THREE.BoxGeometry(lowPartWidth, 80 * SCALE, storageDepth);
            const lowPartMesh = createMeshWithTexture(lowPartGeom, doorMaterial, lowPartWidth, 80 * SCALE);
            lowPartMesh.position.x = mirrorX((storageWidth / 2) - (lowPartWidth / 2));
            lowPartMesh.position.y = (80 * SCALE - 200 * SCALE) / 2; // Align bottom (assuming 200 height center)
            group.add(lowPartMesh);

            // NEW: Counter on low part with 3mm gap
            const counterGeom = new THREE.BoxGeometry(lowPartWidth, 0.02, storageDepth);
            const counterMesh = createMeshWithTexture(counterGeom, doorMaterial, lowPartWidth, storageDepth, true);
            counterMesh.position.x = lowPartMesh.position.x;
            counterMesh.position.y = lowPartMesh.position.y + (80 * SCALE / 2) + 0.003 + (0.02 / 2);
            group.add(counterMesh);
            
            // Vertical lines
            const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const lineDepth = 0.001;
            const lineWidth = 0.002;

            // Lines for Full Height Part
            if (fullPartPanels > 1) {
                const pW = fullHeightPartWidth / fullPartPanels;
                for(let i=1; i<fullPartPanels; i++) {
                    const lg = new THREE.BoxGeometry(lineWidth, 200 * SCALE, lineDepth);
                    const lm = new THREE.Mesh(lg, lineMaterial);
                    lm.position.x = fullHeightMesh.position.x - (fullHeightPartWidth/2) + (pW * i);
                    lm.position.z = storageDepth/2 + lineDepth/2;
                    group.add(lm);
                }
            }
            // Lines for Low Part
            if (lowPartPanels > 1) {
                const pW = lowPartWidth / lowPartPanels;
                for(let i=1; i<lowPartPanels; i++) {
                    const lg = new THREE.BoxGeometry(lineWidth, 80 * SCALE, lineDepth);
                    const lm = new THREE.Mesh(lg, lineMaterial);
                    lm.position.x = lowPartMesh.position.x - (lowPartWidth/2) + (pW * i);
                    lm.position.y = lowPartMesh.position.y;
                    lm.position.z = storageDepth/2 + lineDepth/2;
                    group.add(lm);
                }
            }
            // Add seam line between the two main parts
            const seamLineGeom = new THREE.BoxGeometry(lineWidth, 80 * SCALE, lineDepth);
            const seamLineMesh = new THREE.Mesh(seamLineGeom, lineMaterial);
            const seamX = mirrorX((-storageWidth / 2) + fullHeightPartWidth);
            seamLineMesh.position.x = seamX;
            seamLineMesh.position.y = lowPartMesh.position.y; // Align vertically with the lower part
            seamLineMesh.position.z = storageDepth / 2 + lineDepth / 2;
            group.add(seamLineMesh);

            break;
          }
          case 'storage-200-u': {
            const storageWidth = currentConfig.width * SCALE;
            const storageDepth = 40 * SCALE;
            const isRType = currentConfig.hingeSide === 'right';
            const mirrorX = (x: number) => isRType ? -x : x;
            
            // U-shape layout configuration
            let fullHeightPartWidth, sidePartWidth;
            let fullPartPanels = 1, lowPartPanels = 2;
            let upperPartHeight = 60 * SCALE; // Default

            if (currentConfig.width === 120) {
                // W120: High 40cm (1 panel), Side 80cm (Low 2 panels / Upper 45cm 2 panels)
                fullHeightPartWidth = 40 * SCALE;
                sidePartWidth = 80 * SCALE;
                fullPartPanels = 1;
                lowPartPanels = 2;
                upperPartHeight = 45 * SCALE; // Special height for W120
            } else if (currentConfig.width === 160) {
                // W160: High 80cm (2 panels), Side 80cm (Low 2 panels)
                fullHeightPartWidth = 80 * SCALE;
                sidePartWidth = 80 * SCALE;
                fullPartPanels = 2; // "High 2 div"
                lowPartPanels = 2;  // "Low 2 div" (Revised to 2 for W160)
            } else if (currentConfig.width === 200) {
                // W200: High 80cm (2 panels), Side 120cm (Low 3 panels)
                fullHeightPartWidth = 80 * SCALE;
                sidePartWidth = 120 * SCALE;
                fullPartPanels = 2;
                lowPartPanels = 3;
            } else {
                // Fallback
                fullHeightPartWidth = storageWidth / 3;
                sidePartWidth = storageWidth * 2 / 3;
            }

            // Full height part (Left for L-Type)
            const fullHeightGeom = new THREE.BoxGeometry(fullHeightPartWidth, 200 * SCALE, storageDepth);
            const fullHeightMesh = createMeshWithTexture(fullHeightGeom, doorMaterial, fullHeightPartWidth, 200 * SCALE);
            fullHeightMesh.position.x = mirrorX((-storageWidth / 2) + (fullHeightPartWidth / 2));
            group.add(fullHeightMesh);

            // Low part (Right Bottom for L-Type)
            const lowPartGeom = new THREE.BoxGeometry(sidePartWidth, 80 * SCALE, storageDepth);
            const lowPartMesh = createMeshWithTexture(lowPartGeom, doorMaterial, sidePartWidth, 80 * SCALE);
            lowPartMesh.position.x = mirrorX((storageWidth / 2) - (sidePartWidth / 2));
            lowPartMesh.position.y = (80 * SCALE - 200 * SCALE) / 2; // Align bottom relative to center
            group.add(lowPartMesh);

            // NEW: Counter on low part with 3mm gap
            const counterGeom = new THREE.BoxGeometry(sidePartWidth, 0.02, storageDepth);
            const counterMesh = createMeshWithTexture(counterGeom, doorMaterial, sidePartWidth, storageDepth, true);
            counterMesh.position.x = lowPartMesh.position.x;
            counterMesh.position.y = lowPartMesh.position.y + (80 * SCALE / 2) + 0.003 + (0.02 / 2);
            group.add(counterMesh);
            
            // Upper part (Right Top for L-Type)
            const upperPartGeom = new THREE.BoxGeometry(sidePartWidth, upperPartHeight, storageDepth);
            const upperPartMesh = createMeshWithTexture(upperPartGeom, doorMaterial, sidePartWidth, upperPartHeight);
            upperPartMesh.position.x = mirrorX((storageWidth / 2) - (sidePartWidth / 2));
            // Align top: Top is at +100 (relative to center 0). Center of upper part is +100 - H/2.
            upperPartMesh.position.y = (200 * SCALE / 2) - (upperPartHeight / 2);
            group.add(upperPartMesh);

            // Vertical Lines
            const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const lineDepth = 0.001;
            const lineWidth = 0.002;

            // High Part Lines
            if (fullPartPanels > 1) {
                const pW = fullHeightPartWidth / fullPartPanels;
                for(let i=1; i<fullPartPanels; i++) {
                    const lg = new THREE.BoxGeometry(lineWidth, 200 * SCALE, lineDepth);
                    const lm = new THREE.Mesh(lg, lineMaterial);
                    lm.position.x = fullHeightMesh.position.x - (fullHeightPartWidth/2) + (pW * i);
                    lm.position.z = storageDepth/2 + lineDepth/2;
                    group.add(lm);
                }
            }
            // Low Part Lines
            if (lowPartPanels > 1) {
                const pW = sidePartWidth / lowPartPanels;
                for(let i=1; i<lowPartPanels; i++) {
                    const lg = new THREE.BoxGeometry(lineWidth, 80 * SCALE, lineDepth);
                    const lm = new THREE.Mesh(lg, lineMaterial);
                    lm.position.x = lowPartMesh.position.x - (sidePartWidth/2) + (pW * i);
                    lm.position.y = lowPartMesh.position.y;
                    lm.position.z = storageDepth/2 + lineDepth/2;
                    group.add(lm);
                }
            }
            // Upper Part Lines (Match Low Part usually, or explicit?)
            // Assuming same division as low part for symmetry in U-shape
            if (lowPartPanels > 1) {
                const pW = sidePartWidth / lowPartPanels;
                for(let i=1; i<lowPartPanels; i++) {
                    const lg = new THREE.BoxGeometry(lineWidth, upperPartHeight, lineDepth);
                    const lm = new THREE.Mesh(lg, lineMaterial);
                    lm.position.x = upperPartMesh.position.x - (sidePartWidth/2) + (pW * i);
                    lm.position.y = upperPartMesh.position.y;
                    lm.position.z = storageDepth/2 + lineDepth/2;
                    group.add(lm);
                }
            }

            // Add seam lines between the main parts
            const seamX = mirrorX((-storageWidth / 2) + fullHeightPartWidth);
            // Lower seam
            const seamLineLowerGeom = new THREE.BoxGeometry(lineWidth, 80 * SCALE, lineDepth);
            const seamLineLowerMesh = new THREE.Mesh(seamLineLowerGeom, lineMaterial);
            seamLineLowerMesh.position.x = seamX;
            seamLineLowerMesh.position.y = lowPartMesh.position.y;
            seamLineLowerMesh.position.z = storageDepth / 2 + lineDepth / 2;
            group.add(seamLineLowerMesh);
            // Upper seam
            const seamLineUpperGeom = new THREE.BoxGeometry(lineWidth, upperPartHeight, lineDepth);
            const seamLineUpperMesh = new THREE.Mesh(seamLineUpperGeom, lineMaterial);
            seamLineUpperMesh.position.x = seamX;
            seamLineUpperMesh.position.y = upperPartMesh.position.y;
            seamLineUpperMesh.position.z = storageDepth / 2 + lineDepth / 2;
            group.add(seamLineUpperMesh);

            break;
          }
          case 'folding-2': {
              const panelWidth = doorWidth / 2;
              const hingeSide = currentConfig.hingeSide;

              const panel1 = createPanel(panelWidth, doorHeight, false, false);
              const panel2 = createPanel(panelWidth, doorHeight, false, false);

              const pivotFrame = new THREE.Group();
              const pivotMiddle = new THREE.Group();
              
              // 枠より5cm手前に配置（元の-3cmから+8cm手前へ移動）
              pivotFrame.position.z = 0.05;
              
              if (hingeSide === 'left') {
                  pivotFrame.position.x = -doorWidth / 2;
                  panel1.position.x = panelWidth / 2;
                  pivotMiddle.position.x = panelWidth / 2;
                  panel2.position.x = panelWidth / 2;
              } else { // right hinge
                  pivotFrame.position.x = doorWidth / 2;
                  panel1.position.x = -panelWidth / 2;
                  pivotMiddle.position.x = -panelWidth / 2;
                  panel2.position.x = -panelWidth / 2;
              }

              pivotMiddle.add(panel2);
              panel1.add(pivotMiddle);
              pivotFrame.add(panel1);
              group.add(pivotFrame);
              break;
          }
          case 'folding-4': {
              const panelWidth = doorWidth / 4;
              
              // Left side
              const leftPivotFrame = new THREE.Group();
              const leftPivotMiddle = new THREE.Group();
              const leftPanel1 = createPanel(panelWidth, doorHeight, false, false);
              const leftPanel2 = createPanel(panelWidth, doorHeight, false, false);
              
              // 枠より5cm手前に配置
              leftPivotFrame.position.z = 0.05;
              
              leftPivotFrame.position.x = -doorWidth / 2;
              leftPanel1.position.x = panelWidth / 2;
              leftPivotMiddle.position.x = panelWidth / 2;
              leftPanel2.position.x = panelWidth / 2;
              leftPivotMiddle.add(leftPanel2);
              leftPanel1.add(leftPivotMiddle);
              leftPivotFrame.add(leftPanel1);
              group.add(leftPivotFrame);
              
              // Right side
              const rightPivotFrame = new THREE.Group();
              const rightPivotMiddle = new THREE.Group();
              const rightPanel1 = createPanel(panelWidth, doorHeight, false, false);
              const rightPanel2 = createPanel(panelWidth, doorHeight, false, false);
              
              // 枠より5cm手前に配置
              rightPivotFrame.position.z = 0.05;
              
              rightPivotFrame.position.x = doorWidth / 2;
              rightPanel1.position.x = -panelWidth / 2;
              rightPivotMiddle.position.x = -panelWidth / 2;
              rightPanel2.position.x = -panelWidth / 2;
              rightPivotMiddle.add(rightPanel2);
              rightPanel1.add(rightPivotMiddle);
              rightPivotFrame.add(rightPanel1);
              group.add(rightPivotFrame);
              break;
          }
          case 'folding-6': {
              const panelWidth = doorWidth / 6;

              // Left side (3 panels)
              const leftPivotFrame = new THREE.Group();
              
              // 枠より5cm手前に配置
              leftPivotFrame.position.z = 0.05;
              
              const leftPanel1 = createPanel(panelWidth, doorHeight, false, false);
              leftPivotFrame.add(leftPanel1);

              const leftPivot1_2 = new THREE.Group();
              const leftPanel2 = createPanel(panelWidth, doorHeight, false, false);
              leftPivot1_2.add(leftPanel2);

              const leftPivot2_3 = new THREE.Group();
              const leftPanel3 = createPanel(panelWidth, doorHeight, false, false);
              leftPivot2_3.add(leftPanel3);

              leftPanel2.add(leftPivot2_3);
              leftPanel1.add(leftPivot1_2);

              leftPivotFrame.position.x = -doorWidth / 2;
              leftPanel1.position.x = panelWidth / 2;

              leftPivot1_2.position.x = panelWidth / 2;
              leftPanel2.position.x = panelWidth / 2;

              leftPivot2_3.position.x = panelWidth / 2;
              leftPanel3.position.x = panelWidth / 2;

              group.add(leftPivotFrame);
              
              // Right side (3 panels)
              const rightPivotFrame = new THREE.Group();
              
              // 枠より5cm手前に配置
              rightPivotFrame.position.z = 0.05;
              
              const rightPanel1 = createPanel(panelWidth, doorHeight, false, false);
              rightPivotFrame.add(rightPanel1);

              const rightPivot1_2 = new THREE.Group();
              const rightPanel2 = createPanel(panelWidth, doorHeight, false, false);
              rightPivot1_2.add(rightPanel2);

              const rightPivot2_3 = new THREE.Group();
              const rightPanel3 = createPanel(panelWidth, doorHeight, false, false);
              rightPivot2_3.add(rightPanel3);

              rightPanel2.add(rightPivot2_3);
              rightPanel1.add(rightPivot1_2);

              rightPivotFrame.position.x = doorWidth / 2;
              rightPanel1.position.x = -panelWidth / 2;

              rightPivot1_2.position.x = -panelWidth / 2;
              rightPanel2.position.x = -panelWidth / 2;

              rightPivot2_3.position.x = -panelWidth / 2;
              rightPanel3.position.x = -panelWidth / 2;

              group.add(rightPivotFrame);
              break;
          }
          case 'folding-8': {
              const panelWidth = doorWidth / 8;
              
              // Helper to create a 4-panel bifold system
              const createFourPanelFold = (side: 'left' | 'right') => {
                  const pivotFrame = new THREE.Group();
                  
                  // 枠より5cm手前に配置
                  pivotFrame.position.z = 0.05;
                  
                  const panels = Array.from({ length: 4 }, () => createPanel(panelWidth, doorHeight, false, false));
                  const pivots = Array.from({ length: 3 }, () => new THREE.Group());

                  panels[2].add(pivots[2]);
                  pivots[2].add(panels[3]);
                  
                  panels[1].add(pivots[1]);
                  pivots[1].add(panels[2]);

                  panels[0].add(pivots[0]);
                  pivots[0].add(panels[1]);

                  pivotFrame.add(panels[0]);

                  if (side === 'left') {
                      pivotFrame.position.x = -doorWidth / 2;
                      panels.forEach(p => p.position.x = panelWidth / 2);
                      pivots.forEach(p => p.position.x = panelWidth / 2);
                  } else {
                      pivotFrame.position.x = doorWidth / 2;
                      panels.forEach(p => p.position.x = -panelWidth / 2);
                      pivots.forEach(p => p.position.x = -panelWidth / 2);
                  }
                  return pivotFrame;
              };

              group.add(createFourPanelFold('left'));
              group.add(createFourPanelFold('right'));
              break;
          }
           case 'sliding-outset': {
               // For sliding-outset, the user config width IS the panel width.
               const handleSide = currentConfig.hingeSide === 'right' ? 'left' : 'right';
               const panelWidth = openingWidth; 
               const panel = createPanel(panelWidth, doorHeight, canHaveGlass, true, handleSide);

               panel.position.z = FRAME_DEPTH / 2 + currentDoorThickness / 2;
               
               // The door just sits over the opening, so for preview, center it.
               // The rail will show the full travel path.
               panel.position.x = 0;
               
               group.add(panel);
               break;
           }
           case 'sliding-inset':
           case 'sliding-hikikomi': {
               // For these, config width is TOTAL width (opening + pocket). Panel is half.
               const handleSide = currentConfig.hingeSide === 'right' ? 'left' : 'right';
               const panelWidth = openingWidth / 2; 
               const panel = createPanel(panelWidth, doorHeight, canHaveGlass, true, handleSide);
               const panelPositionX = (currentConfig.hingeSide === 'right' ? -1 : 1) * (openingWidth / 4);
               panel.position.x = panelPositionX;
               group.add(panel);
               break;
           }
          case 'sliding-2': { // 2枚引き違い
              const panelWidth = doorWidth / 2 + (5 * SCALE); // Overlap by 5cm
              const panel1 = createPanel(panelWidth, doorHeight, false, true, 'left');
              const panel2 = createPanel(panelWidth, doorHeight, false, true, 'right');
              panel1.position.x = -doorWidth / 4;
              panel2.position.x = doorWidth / 4;
              panel2.position.z = currentDoorThickness; // Place one in front of the other
              group.add(panel1, panel2);
              break;
          }
          case 'sliding-3': { // 3枚引き違い
              const panelWidth = doorWidth / 3 + (5 * SCALE);
              const panel1 = createPanel(panelWidth, doorHeight, false, true, 'left');
              const panel2 = createPanel(panelWidth, doorHeight, false, true, 'left');
              const panel3 = createPanel(panelWidth, doorHeight, false, true, 'right');
              
              panel1.position.x = -doorWidth / 3;
              panel2.position.x = 0;
              panel3.position.x = doorWidth / 3;
              
              panel1.position.z = 0;
              panel2.position.z = currentDoorThickness;
              panel3.position.z = currentDoorThickness * 2;
              
              group.add(panel1, panel2, panel3);
              break;
          }
          case 'sliding-kata-2': { // 2枚片引き
              // Usually slides to one side. 
              // Assuming hingeSide='right' (Left Hinge Text/Right Hand) means it stacks on the LEFT and slides RIGHT.
              // Assuming hingeSide='left' (Right Hinge Text/Left Hand) means it stacks on the RIGHT and slides LEFT.
              const isStackLeft = currentConfig.hingeSide === 'right';
              const panelWidth = doorWidth / 2;
              
              // Reverse handle position logic for kata-2
              const handleSide = isStackLeft ? 'left' : 'right';

              const panel1 = createPanel(panelWidth, doorHeight, false, true, handleSide);
              const panel2 = createPanel(panelWidth, doorHeight, false, true, handleSide);
              
              // Default layout (Stack Left): P1 at -W/4, P2 at W/4.
              if (isStackLeft) {
                  panel1.position.x = -doorWidth / 4;
                  panel2.position.x = doorWidth / 4;
              } else {
                  // Mirror for Stack Right
                  panel1.position.x = doorWidth / 4; // Mirror of -W/4
                  panel2.position.x = -doorWidth / 4; // Mirror of W/4
              }
              
              // SWAP Z POSITIONS (Reverse of previous logic)
              // Previously panel2 (Right/Front) was at currentDoorThickness.
              // Now panel1 (Left/Back) is at currentDoorThickness (Front), panel2 is at 0 (Back).
              panel1.position.z = currentDoorThickness;
              panel2.position.z = 0;
              
              group.add(panel1, panel2);
              break;
          }
          case 'sliding-kata-3': { // 3枚片引き
              const isStackLeft = currentConfig.hingeSide === 'right';
              const panelWidth = doorWidth / 3;
              // Moved handle to opposite side as requested
              const handleSide = isStackLeft ? 'right' : 'left';

              const panel1 = createPanel(panelWidth, doorHeight, false, true, handleSide);
              const panel2 = createPanel(panelWidth, doorHeight, false, true, handleSide);
              const panel3 = createPanel(panelWidth, doorHeight, false, true, handleSide);
              
              if (isStackLeft) {
                  panel1.position.x = -doorWidth / 3;
                  panel2.position.x = 0;
                  panel3.position.x = doorWidth / 3;
              } else {
                  // Mirror
                  panel1.position.x = doorWidth / 3;
                  panel2.position.x = 0;
                  panel3.position.x = -doorWidth / 3;
              }
              
              // Reverse Z-Order Again: P1 (Stack side) -> Back, P3 (Open side) -> Front
              // Now: P1(0), P2(Thick), P3(Thick*2)
              panel1.position.z = 0;
              panel2.position.z = currentDoorThickness;
              panel3.position.z = currentDoorThickness * 2;
              
              group.add(panel1, panel2, panel3);
              break;
          }
          case 'sliding-4': { // 4枚引き違い
              const panelWidth = doorWidth / 4 + (5*SCALE);
              const panel1 = createPanel(panelWidth, doorHeight, false, true, 'left');
              const panel2 = createPanel(panelWidth, doorHeight, false, true, 'right');
              const panel3 = createPanel(panelWidth, doorHeight, false, true, 'left', 10);
              const panel4 = createPanel(panelWidth, doorHeight, false, true, 'right');
              
              // Center two panels
              panel2.position.x = -doorWidth / 8;
              panel3.position.x = doorWidth / 8;
              
              // Outer two panels
              panel1.position.x = -doorWidth/2 + panelWidth/2;
              panel4.position.x = doorWidth/2 - panelWidth/2;
              
              panel1.position.z = currentDoorThickness;
              panel4.position.z = currentDoorThickness;

              group.add(panel1, panel2, panel3, panel4);
              break;
          }
      }

      // --- ドア枠の作成 ---
      if (!isStorageType && !currentConfig.doorType.startsWith('material-')) {
        let frameWidth = openingWidth;
        if (isSingleSliding) {
            frameWidth = openingWidth;
        } else if (['sliding-kata-2', 'sliding-kata-3', 'sliding-4', 'sliding-3'].includes(currentConfig.doorType)) {
            frameWidth = doorWidth;
        }
        
        const isThreeWay = currentConfig.frameType === 'threeWay';

        // Dynamic frame dimensions based on type
        const frameThickness = isThreeWay ? 0.011 : FRAME_THICKNESS;
        let frameDepth = isThreeWay ? 0.150 : FRAME_DEPTH;
        // Special override for storage door
        if (currentConfig.doorType === 'hinged-storage') {
            frameDepth = 0.04;
        }

        if (currentConfig.doorType !== 'sliding-outset') {
          if (isThreeWay) {
            // 上枠
            const topFrameGeom = new THREE.BoxGeometry(frameWidth + frameThickness * 2, frameThickness, frameDepth);
            const topFrameMesh = createMeshWithTexture(topFrameGeom, frameMaterial, frameWidth + frameThickness * 2, frameThickness);
            topFrameMesh.position.y = doorHeight / 2 + frameThickness / 2;
            group.add(topFrameMesh);
          }
  
          // 横枠
          const sideFrameHeight = isThreeWay ? doorHeight + frameThickness : doorHeight;
          const sideFrameCenterY = isThreeWay ? frameThickness / 2 : 0;
          const sideFrameGeom = new THREE.BoxGeometry(frameThickness, sideFrameHeight, frameDepth);
          
          // 左枠
          const leftFrameMesh = createMeshWithTexture(sideFrameGeom, frameMaterial, frameThickness, sideFrameHeight);
          leftFrameMesh.position.x = -(frameWidth / 2) - (frameThickness / 2);
          leftFrameMesh.position.y = sideFrameCenterY;
          group.add(leftFrameMesh);
          
          // 右枠
          const rightFrameMesh = createMeshWithTexture(sideFrameGeom, frameMaterial, frameThickness, sideFrameHeight);
          rightFrameMesh.position.x = (frameWidth / 2) + (frameThickness / 2);
          rightFrameMesh.position.y = sideFrameCenterY;
          group.add(rightFrameMesh);
        }

        // 引き戸用のレール
        if (currentConfig.doorType === 'sliding-outset' || currentConfig.doorType === 'sliding-inset' || currentConfig.doorType === 'sliding-hikikomi' || isMultiPanelSliding) {
          const railHeight = 0.05;
          let railWidth = frameWidth; // Default
          if (currentConfig.doorType === 'sliding-outset') {
            // For sliding-outset, config.width is the panel width. Rail is ~2x panel width.
            railWidth = openingWidth * 2;
          } else if(isSingleSliding) {
            // For inset/hikikomi, rail covers total width
            railWidth = openingWidth;
          }
          
          const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(currentConfig.doorType);
          const extension = 80 * SCALE; // 80cm extension

          if (isKataSliding) {
            railWidth += extension;
          }

          let railDepth = 0.05;
          if(currentConfig.doorType === 'sliding-kata-3' || currentConfig.doorType === 'sliding-3') railDepth = 0.15;
          else if (isMultiPanelSliding) railDepth = 0.1;

          const railGeom = new THREE.BoxGeometry(railWidth, railHeight, railDepth);
          const railMesh = new THREE.Mesh(railGeom, frameMaterial);
          
          const hasFrame = currentConfig.doorType !== 'sliding-outset';
          const railBaseY = (doorHeight / 2) + (hasFrame && isThreeWay ? frameThickness : 0);
          railMesh.position.y = railBaseY + railHeight / 2;
          
          if (isMultiPanelSliding) {
              railMesh.position.z = railDepth / 2;
              if (isKataSliding) {
                // If hingeSide='right' (Stack Left), extend to right?
                // Usually rail extends to where the door slides.
                // If Stack Left (hingeSide='right'), slide right -> Extension on right.
                // If Stack Right (hingeSide='left'), slide left -> Extension on left.
                
                // railMesh center is 0. Width is frameWidth + extension.
                // If Stack Left: shift rail right by extension/2
                // If Stack Right: shift rail left by extension/2
                
                const isStackLeft = currentConfig.hingeSide === 'right';
                railMesh.position.x = isStackLeft ? extension / 2 : -extension / 2;
              }
          } else { // Single Sliding (inset/outset)
              const railZ = currentConfig.doorType === 'sliding-outset' ? (FRAME_DEPTH / 2 + 0.02) : 0;
              railMesh.position.z = railZ;
              
              if (currentConfig.doorType === 'sliding-outset') {
                  // Shift the rail to the side where the door slides ('戸袋側').
                  // 'right' hingeSide means pocket on the right, door slides right.
                  const shiftDirection = currentConfig.hingeSide === 'right' ? 1 : -1;
                  railMesh.position.x = shiftDirection * (openingWidth / 2);
              } else {
                  // For inset/hikikomi, the rail is centered over the total width.
                  railMesh.position.x = 0;
              }
          }

          group.add(railMesh);
        }
      }

      if (isStorageType) {
          const wallHeight = 240 * SCALE;
          const wallWidth = (currentConfig.width + 40) * SCALE;
          const wallDepth = 2 * SCALE;
          
          const wallGeom = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
          const wallMat = new THREE.MeshStandardMaterial({ 
              color: 0xffffff, 
              transparent: true, 
              opacity: 0.2, 
              side: THREE.DoubleSide,
              depthWrite: false 
          });
          const wallMesh = new THREE.Mesh(wallGeom, wallMat);
          
          const storageHeight = currentConfig.height * SCALE;
          
          // Align bottom of wall with bottom of storage
          wallMesh.position.y = (wallHeight - storageHeight) / 2;
          
          // Place behind storage. Storage depth is 40 * SCALE.
          const storageDepth = 40 * SCALE;
          wallMesh.position.z = -(storageDepth / 2) - (wallDepth / 2) - 0.01;
          
          group.add(wallMesh);
      }

      // ドアパネル群と枠の底面がY=0になるようにグループ全体を移動
      const finalHeight = isStorageType ? currentConfig.height * SCALE : doorHeight;
      group.position.y = finalHeight / 2;

      return group;
  };

  useEffect(() => {
      if (!mountRef.current) return;
      const mountNode = mountRef.current;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe0e0e0);
      scene.fog = new THREE.Fog(0xe0e0e0, 10, 50);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(50, mountNode.clientWidth / mountNode.clientHeight, 0.1, 100);
      // Default distance was 3.33 (5 / 1.5). To zoom in 30%, we reduce distance by ~1.3x.
      // 3.33 / 1.3 ≈ 2.56. Setting to 2.5 for a good close-up view.
      camera.position.set(0, 1.5, 2.5); 
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Add soft shadow support
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mountNode.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 1.2, 0);
      controls.maxPolarAngle = Math.PI / 1.8;
      controls.minPolarAngle = Math.PI / 3;
      controls.minDistance = 1.5; // Allow zooming in closer
      controls.maxDistance = 8;

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 3);
      dirLight.position.set(-5, 5, 5);
      dirLight.castShadow = true;
      // High quality shadows to prevent artifacts on white doors
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.bias = -0.0005;
      scene.add(dirLight);
      
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0xbbbbbb, depthWrite: false }));
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onClick = (event: MouseEvent) => {
          if (!mountRef.current || !cameraRef.current) return;

          event.preventDefault();

          const rect = mountRef.current.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, cameraRef.current);

          const intersects = raycaster.intersectObjects(clickablePanelsRef.current, true);

          if (intersects.length > 0) {
              isDoorOpenRef.current = !isDoorOpenRef.current;
          }
      };
      
      mountNode.addEventListener('click', onClick);
      
      const handleResize = () => {
          if (mountNode && camera && renderer) {
              const width = mountNode.clientWidth;
              const height = mountNode.clientHeight;
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              renderer.setSize(width, height);
          }
      };
      
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(mountNode);

      let animationFrameId: number;
      const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          controls.update();

          // Animation logic
          const targetOpen = isDoorOpenRef.current;
          const rotationSpeed = 0.05;

          doorPivotsRef.current.forEach(pivot => {
            const direction = pivot.userData.rotationDirection || 1;
            const targetRotation = targetOpen ? (Math.PI / 2.2) * direction : 0;
            pivot.rotation.y += (targetRotation - pivot.rotation.y) * rotationSpeed;
          });

          renderer.render(scene, camera);
      };
      animate();
      
      return () => {
          cancelAnimationFrame(animationFrameId);
          mountNode.removeEventListener('click', onClick);
          if (mountNode) {
              mountNode.removeChild(renderer.domElement);
          }
          resizeObserver.disconnect();
          renderer.dispose();
          controls.dispose();
      };
  }, []);

  useEffect(() => {
      if (!sceneRef.current || !cameraRef.current) return;
      const scene = sceneRef.current;

      const oldDoor = scene.getObjectByName('doorGroup');
      if (oldDoor) {
          scene.remove(oldDoor);
          // Properly dispose of old geometry and materials if needed
          oldDoor.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
          });
      }

      const doorGroup = createDoorGroup(config);
      doorGroup.name = 'doorGroup';

      if (config.doorType === 'hinged' || config.doorType === 'hinged-storage' || config.doorType === 'double') {
        doorGroup.rotation.y = Math.PI; // Rotate hinged door 180 degrees
      }

      doorGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
      });
      scene.add(doorGroup);

  }, [config, colors]);

  const doorTypeName = config.doorType === 'unselected' ? '' : getOptionName(doorTypes, config.doorType);
  
  const showHingeSide = ['hinged', 'hinged-storage', 'sliding-inset', 'sliding-outset', 'folding-2', 'sliding-kata-2', 'sliding-kata-3', 'sliding-hikikomi', 'storage-200-l', 'storage-200-u'].includes(config.doorType);
  const isPocketSliding = ['sliding-inset', 'sliding-outset', 'sliding-hikikomi'].includes(config.doorType);
  const isKataSliding = ['sliding-kata-2', 'sliding-kata-3'].includes(config.doorType);
  const isStorageLR = ['storage-200-l', 'storage-200-u'].includes(config.doorType);
  
  let hingeSideText = '';
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

  const frameTypeName = getOptionName(frameTypes, config.frameType);
  const colorName = getOptionName(colors, config.color);
  const glassStyleName = getOptionName(glassStyles, config.glassStyle);

  if (config.doorType === 'unselected') {
      return (
        <div className="relative w-full h-full bg-gray-200 rounded-lg shadow-inner flex items-center justify-center" ref={mountRef}>
        </div>
      );
  }

  return (
    <div className="relative w-full h-full bg-gray-200 rounded-lg shadow-inner cursor-move" ref={mountRef}>
       <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
         ドアをクリックで開閉
       </div>
       <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
         ドラッグで回転、スクロールでズーム
       </div>

      <div className="absolute top-4 right-4 text-black text-sm p-3 pointer-events-none w-48" style={{ textShadow: 'none' }}>
        <ul className="space-y-1">
          <li className="font-bold text-base truncate">
            {doorTypeName}
          </li>
          {showHingeSide && <li className="text-sm opacity-90">{hingeSideText}</li>}
          {!config.doorType.startsWith('material-') && (
            <>
                <li className="pt-1">幅{config.width.toFixed(1)}㎝</li>
                <li>高さ{config.height}㎝</li>
            </>
          )}
          {config.doorType.startsWith('material-') && (
             <li className="pt-1">数量: {config.count}{config.doorType === 'material-corner-skirting' ? '個' : '本'}</li>
          )}

          {!config.doorType.startsWith('storage-') && !config.doorType.startsWith('material-') && (
            <li>{frameTypeName}</li>
          )}
          <li className="truncate">{colorName}</li>
          {config.glassStyle !== 'none' && (
            <li className="truncate">{glassStyleName}</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DoorPreview;
