
export type ColorId = 'ww' | 'lg' | 'dg' | 'co' | 'ga' | 'pw';
export type HandleId = 'satin-nickel' | 'white' | 'black';
export type GlassStyleId = 'none' | 'clear' | 'frosted';
export type LockId = 'none' | 'display-lock';
export type DoorTypeId =
  'unselected' |
  'material' | // Group ID
  'material-skirting' |
  'material-corner-skirting' |
  'material-window-sill' |
  'hinged' |
  'hinged-storage' |
  'sliding-single' | // Group ID
  'sliding-inset' |
  'sliding-outset' |
  'sliding-hikikomi' |
  'double' |
  'storage' | // Group ID
  'storage-80' |
  'storage-separate' |
  'storage-200-l' |
  'storage-200-u' |
  'storage-200-full' |
  'sliding' | // Group ID
  'sliding-2' |
  'sliding-3' |
  'sliding-kata-2' |
  'sliding-kata-3' |
  'sliding-4' |
  'folding' | // Group ID
  'folding-2' |
  'folding-4' |
  'folding-6' |
  'folding-8';
export type FrameTypeId = 'threeWay' | 'twoWay';

export interface MatrixPriceEntry {
  h90?: number;
  h120?: number;
  h2000?: number;
  h2200?: number;
  h2400?: number;
  url?: string;
}

export type MatrixPrices = Record<string, MatrixPriceEntry>;

export interface DoorOption<T> {
  id: T;
  name: string;
  price: number; // for H <= 200cm (Standard)
  priceH2200: number; // for H <= 220cm
  priceH2400: number; // for H > 220cm
  priceH90?: number; // for H <= 90cm
  priceH120?: number; // for H <= 120cm
  // Storage specific width-based prices
  priceW80?: number;
  priceW120?: number;
  priceW160?: number;
  priceW200?: number;
  // Storage specific R-Type prices (for L and U shapes)
  priceW80_R?: number;
  priceW120_R?: number;
  priceW160_R?: number;
  priceW200_R?: number;
  
  subOptions?: DoorOption<T>[];
  detailDrawingUrl?: string; // Link to the detail drawing PDF/Image
  detailDrawingUrl_R?: string; // Link for R-Type storage options

  // Width-specific URLs for storage
  detailDrawingUrlW80?: string;
  detailDrawingUrlW120?: string;
  detailDrawingUrlW160?: string;
  detailDrawingUrlW200?: string;
  detailDrawingUrlW80_R?: string;
  detailDrawingUrlW120_R?: string;
  detailDrawingUrlW160_R?: string;
  detailDrawingUrlW200_R?: string;
}

export interface ColorOption extends DoorOption<ColorId> {
  shortId: string;
  class: string;
  handleColorClass: string;
  hex: string;
  previewHex: string;
  handleHex: string;
  category: 'monotone' | 'wood';
  swatchUrl: string;
  textureUrl?: string;
}

export interface DoorConfiguration {
  doorType: DoorTypeId;
  color: ColorId;
  handle: HandleId;
  glassStyle: GlassStyleId;
  lock: LockId;
  width: number; // in cm
  height: number; // in cm
  count: number; // Quantity for materials
  hingeSide: 'left' | 'right';
  frameType: FrameTypeId;
}

export interface SavedDoor {
  id: string;
  config: DoorConfiguration;
  price: number;
  roomName?: string;
}

export interface ProjectInfo {
  customerName: string;
  constructionLocation: string;
  constructionCompany: string;
  shippingCost: number;
  defaultHeight?: number;
  defaultColor?: ColorId;
  defaultHandle?: HandleId;
}

export interface DimensionConfig {
  frameOuterW: string;
  frameInnerW: string;
  doorW: string;
  frameOuterH: string;
  frameInnerH: string;
  doorH: string;
  railLength: string;
}

export type DimensionSettings = Record<string, DimensionConfig>;