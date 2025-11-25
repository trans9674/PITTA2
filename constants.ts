
import { DoorOption, ColorOption, DoorTypeId, DoorConfiguration, FrameTypeId, HandleId, GlassStyleId, LockId, DimensionSettings, MatrixPrices } from './types';
import { MATRIX_ROWS } from './components/AdminMatrixDefinition';

export const DOOR_TYPES: DoorOption<DoorTypeId>[] = [
  {
    "id": "hinged",
    "name": "片開き",
    "price": 24700,
    "priceH2200": 27300,
    "priceH2400": 28200,
    "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KB3H2400.pdf"
  },
  {
    "id": "sliding-single",
    "name": "片引き",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "subOptions": [
      {
        "id": "sliding-inset",
        "name": "片引きインセット",
        "price": 28800,
        "priceH2200": 30300,
        "priceH2400": 31200,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KHinset2400.pdf"
      },
      {
        "id": "sliding-outset",
        "name": "アウトセット",
        "price": 33300,
        "priceH2200": 26600,
        "priceH2400": 26600,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2400.pdf"
      },
      {
        "id": "sliding-hikikomi",
        "name": "引込み戸",
        "price": 32000,
        "priceH2200": 34000,
        "priceH2400": 35000,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HIKIKOMI.pdf"
      }
    ]
  },
  {
    "id": "sliding",
    "name": "引き違い",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "subOptions": [
      {
        "id": "sliding-2",
        "name": "2枚引き違い",
        "price": 47100,
        "priceH2200": 49200,
        "priceH2400": 51100,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HT1.pdf"
      },
      {
        "id": "sliding-3",
        "name": "3枚引き違い",
        "price": 150000,
        "priceH2200": 160000,
        "priceH2400": 160000,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HT3.pdf"
      },
      {
        "id": "sliding-kata-2",
        "name": "2枚片引き",
        "price": 59300,
        "priceH2200": 61600,
        "priceH2400": 63400,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH2maihikikomi.pdf"
      },
      {
        "id": "sliding-kata-3",
        "name": "3枚片引き",
        "price": 85800,
        "priceH2200": 88900,
        "priceH2400": 91700,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH2maihikikomi.pdf"
      },
      {
        "id": "sliding-4",
        "name": "4枚引き違い（2本溝）",
        "price": 91700,
        "priceH2200": 95300,
        "priceH2400": 98900,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH3maihikikomi.pdf"
      }
    ]
  },
  {
    "id": "double",
    "name": "両開き戸",
    "price": 20400,
    "priceH2200": 22000,
    "priceH2400": 22900,
    "priceH90": 12000,
    "priceH120": 13800,
    "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HT4.pdf"
  },
  {
    "id": "folding",
    "name": "折戸",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "subOptions": [
      {
        "id": "folding-2",
        "name": "2枚折戸",
        "price": 16200,
        "priceH2200": 17200,
        "priceH2400": 17500
      },
      {
        "id": "folding-4",
        "name": "4枚折戸",
        "price": 26300,
        "priceH2200": 27700,
        "priceH2400": 28300,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OR4mai.pdf"
      },
      {
        "id": "folding-6",
        "name": "6枚折戸",
        "price": 51600,
        "priceH2200": 53700,
        "priceH2400": 54700,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OREDO6.pdf"
      },
      {
        "id": "folding-8",
        "name": "8枚折戸",
        "price": 66700,
        "priceH2200": 69300,
        "priceH2400": 70700,
        "detailDrawingUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OREDO8.pdf"
      }
    ]
  },
  {
    "id": "hinged-storage",
    "name": "片開き物入",
    "price": 12800,
    "priceH2200": 13900,
    "priceH2400": 14300,
    "priceH90": 7700,
    "priceH120": 9000
  },
  {
    "id": "storage",
    "name": "玄関収納",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "subOptions": [
      {
        "id": "storage-80",
        "name": "フロアタイプ　高さ90㎝",
        "price": 20000,
        "priceH2200": 20000,
        "priceH2400": 20000,
        "priceW80": 27000,
        "priceW120": 35000,
        "priceW160": 44700,
        "priceW200": 59900,
        "detailDrawingUrlW80": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBfloor7W800.pdf",
        "detailDrawingUrlW120": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBfloor9W1200(L).pdf",
        "detailDrawingUrlW160": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBfloor10W1600.pdf",
        "detailDrawingUrlW200": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBfloor12W2000(L).pdf"
      },
      {
        "id": "storage-separate",
        "name": "セパレート",
        "price": 40000,
        "priceH2200": 42000,
        "priceH2400": 44000,
        "priceW80": 40000,
        "priceW120": 0,
        "priceW160": 0,
        "priceW200": 0,
        "detailDrawingUrlW80": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBE1W800.pdf",
        "detailDrawingUrlW120": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBE3W1200(L).pdf",
        "detailDrawingUrlW160": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBE4W1600.pdf",
        "detailDrawingUrlW200": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBE6W2000(L).pdf"
      },
      {
        "id": "storage-200-l",
        "name": "L型　高さ200㎝",
        "price": 45000,
        "priceH2200": 46000,
        "priceH2400": 47000,
        "priceW80": 45000,
        "priceW120": 0,
        "priceW160": 0,
        "priceW200": 0,
        "priceW80_R": 45000,
        "detailDrawingUrlW80": "",
        "detailDrawingUrlW120": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBL2W1200(L).pdf",
        "detailDrawingUrlW160": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBL4W1600(L).pdf",
        "detailDrawingUrlW200": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBL6W2000(L).pdf",
        "detailDrawingUrlW80_R": "",
        "detailDrawingUrlW120_R": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBL1W1200(R).pdf",
        "detailDrawingUrlW160_R": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBL3W1600(R).pdf",
        "detailDrawingUrlW200_R": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBL5W2000(R).pdf"
      },
      {
        "id": "storage-200-u",
        "name": "コの字型　高さ200㎝",
        "price": 52000,
        "priceH2200": 53500,
        "priceH2400": 55000,
        "priceW80": 52000,
        "priceW120": 0,
        "priceW160": 0,
        "priceW200": 0,
        "priceW80_R": 52000,
        "detailDrawingUrlW120": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBC2W1200(L).pdf",
        "detailDrawingUrlW160": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBC4W1600(L).pdf",
        "detailDrawingUrlW200": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBC6W2000(L).pdf",
        "detailDrawingUrlW120_R": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBC1W1200(R).pdf",
        "detailDrawingUrlW160_R": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBC3W1600(R).pdf",
        "detailDrawingUrlW200_R": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBC5W2000(R).pdf"
      },
      {
        "id": "storage-200-full",
        "name": "トール　高さ200㎝",
        "price": 50000,
        "priceH2200": 51500,
        "priceH2400": 53000,
        "priceW80": 50000,
        "priceW120": 0,
        "priceW160": 0,
        "priceW200": 0,
        "detailDrawingUrlW80": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBI1W800.pdf",
        "detailDrawingUrlW120": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBI3W1200(L).pdf",
        "detailDrawingUrlW160": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/SBI4W1600.pdf"
      }
    ]
  },
  {
    "id": "material",
    "name": "造作材",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "subOptions": [
        {
            "id": "material-skirting",
            "name": "スリム巾木t5.5×H23×L3960",
            "price": 900,
            "priceH2200": 900,
            "priceH2400": 900
        },
        {
            "id": "material-corner-skirting",
            "name": "スリムコーナー巾木",
            "price": 500,
            "priceH2200": 500,
            "priceH2400": 500
        },
        {
            "id": "material-window-sill",
            "name": "窓台",
            "price": 4000,
            "priceH2200": 4000,
            "priceH2400": 4000
        }
    ]
  }
];

export const FRAME_TYPES: DoorOption<FrameTypeId>[] = [
  {
    "id": "twoWay",
    "name": "2方枠",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0
  },
  {
    "id": "threeWay",
    "name": "3方枠",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0
  }
];

export const COLORS: ColorOption[] = [
  {
    "id": "ww",
    "shortId": "WW",
    "name": "ピュアホワイト",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "class": "bg-gray-100",
    "handleColorClass": "bg-gray-700",
    "hex": "#FFFFFF",
    "previewHex": "#FFFFFF",
    "handleHex": "#4A5568",
    "category": "monotone",
    "swatchUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/QVke6EAAAAASUVORK5CYII="
  },
  {
    "id": "lg",
    "shortId": "LG",
    "name": "ライトグレー",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "class": "bg-gray-400",
    "handleColorClass": "bg-gray-800",
    "hex": "#B0AFA9",
    "previewHex": "#B0AFA9",
    "handleHex": "#2D3748",
    "category": "monotone",
    "swatchUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/LG.jpg"
  },
  {
    "id": "dg",
    "shortId": "DG",
    "name": "ダークグレー",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "class": "bg-gray-700",
    "handleColorClass": "bg-gray-300",
    "hex": "#505050",
    "previewHex": "#505050",
    "handleHex": "#D1D5DB",
    "category": "monotone",
    "swatchUrl": "http://25663cc9bda9549d.main.jp/aistudio/door/DG.jpg"
  },
  {
    "id": "co",
    "shortId": "CO",
    "name": "コンフォートオーク",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "class": "bg-orange-200",
    "handleColorClass": "bg-gray-700",
    "hex": "#C1A37D",
    "previewHex": "#D4B895",
    "handleHex": "#4A5568",
    "category": "wood",
    "swatchUrl": "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/CO.jpg",
    "textureUrl": "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/CO.jpg"
  },
  {
    "id": "ga",
    "shortId": "GA",
    "name": "グレージュアッシュ",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "class": "bg-stone-400",
    "handleColorClass": "bg-gray-800",
    "hex": "#8F735B",
    "previewHex": "#A28770",
    "handleHex": "#2D3748",
    "category": "wood",
    "swatchUrl": "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/GA.jpg",
    "textureUrl": "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/GA.jpg"
  },
  {
    "id": "pw",
    "shortId": "WW",
    "name": "プレシャスウォールナット",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0,
    "class": "bg-yellow-900",
    "handleColorClass": "bg-gray-300",
    "hex": "#593D25",
    "previewHex": "#6E4E32",
    "handleHex": "#D1D5DB",
    "category": "wood",
    "swatchUrl": "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/PW.jpg",
    "textureUrl": "https://images.weserv.nl/?url=25663cc9bda9549d.main.jp/aistudio/door/PW.jpg"
  }
];

export const HANDLES: DoorOption<HandleId>[] = [
  {
    "id": "satin-nickel",
    "name": "サテンニッケル",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0
  },
  {
    "id": "white",
    "name": "ホワイト",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0
  },
  {
    "id": "black",
    "name": "マットブラック",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0
  }
];

export const GLASS_STYLES: DoorOption<GlassStyleId>[] = [
  {
    "id": "none",
    "name": "ガラスなし",
    "price": 0,
    "priceH2200": 0,
    "priceH2400": 0
  },
  {
    "id": "clear",
    "name": "透明強化ガラス5mm",
    "price": 27300,
    "priceH2200": 25900,
    "priceH2400": 25500
  },
  {
    "id": "frosted",
    "name": "すりガラス",
    "price": 21300,
    "priceH2200": 21300,
    "priceH2400": 21300
  }
];

export const LOCKS: DoorOption<LockId>[] = [
    {
        "id": "none",
        "name": "なし",
        "price": 0,
        "priceH2200": 0,
        "priceH2400": 0
    },
    {
        "id": "display-lock",
        "name": "表示錠",
        "price": 2200,
        "priceH2200": 2200,
        "priceH2400": 2200
    }
];

export const BASE_PRICE = 0;
export const PRICE_PER_SQ_CM = 0;

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export const SHIPPING_RATES: Record<string, number> = {
  "青森県": 58000,
  "岩手県": 53000, "宮城県": 53000, "秋田県": 53000, "山形県": 53000, "福島県": 53000,
  "茨城県": 48000, "栃木県": 45000, "群馬県": 45000,
  "埼玉県": 43000, "千葉県": 43000, "東京都": 43000, "神奈川県": 43000,
  "新潟県": 42000, "富山県": 42000, "石川県": 42000, "福井県": 42000,
  "山梨県": 42000, "長野県": 42000,
  "岐阜県": 40000, "静岡県": 42000, "愛知県": 40000, "三重県": 40000,
  "滋賀県": 42000, "京都府": 42000, "大阪府": 42000, "兵庫県": 45000, "奈良県": 42000, "和歌山県": 45000,
  "鳥取県": 50000, "島根県": 58000, "岡山県": 50000, "広島県": 50000, "山口県": 58000,
  "徳島県": 48000, "香川県": 48000, "愛媛県": 53000, "高知県": 48000,
  "福岡県": 68000, "佐賀県": 68000, "長崎県": 68000, "熊本県": 68000, "大分県": 68000, "宮崎県": 68000, "鹿児島県": 68000,
  "沖縄県": 0, "北海道": 0
};

export const INITIAL_CONFIG: DoorConfiguration = {
  doorType: 'unselected',
  color: 'ww',
  handle: 'satin-nickel',
  glassStyle: 'none',
  lock: 'none',
  width: 80,
  height: 220,
  count: 1,
  hingeSide: 'right',
  frameType: 'twoWay',
};

// Dimensions table configuration
export const DIMENSION_ROWS = [
    { id: 'hinged_3way', group: '片開き', label: '3方枠' },
    { id: 'hinged_2way', group: '片開き', label: '2方枠' },
    { id: 'sliding_inset_h2000_wall', group: '片引きインセット', label: 'H2000 壁付レール' },
    { id: 'sliding_inset_h2200_ceiling', group: '片引きインセット', label: 'H2200 天井埋込みレール' },
    { id: 'sliding_inset_h2400_ceiling', group: '片引きインセット', label: 'H2400 天井埋込みレール' },
    { id: 'sliding_outset_h2000_wall', group: '片引きアウトセット', label: 'H2000 壁付レール' },
    { id: 'sliding_outset_normal', group: '片引きアウトセット', label: 'H2200~2400 通常' },
    { id: 'sliding_outset_lock', group: '片引きアウトセット', label: 'H2200~2400 天井埋込みレール 鎌錠' },
    { id: 'sliding_outset_corner', group: '片引きアウトセット', label: 'H2200~2400 天井埋込みレール 入隅' },
    { id: 'sliding_outset_corner_lock', group: '片引きアウトセット', label: 'H2200~2400 天井埋込みレール 入隅鎌錠' },
    { id: 'sliding_2_3way', group: '2枚引き違い', label: '3方枠' },
    { id: 'sliding_2_2way', group: '2枚引き違い', label: '2方枠' },
    { id: 'sliding_3_3way', group: '3枚引き違い', label: '3方枠' },
    { id: 'sliding_3_2way', group: '3枚引き違い', label: '2方枠' },
    { id: 'sliding_kata_2_3way', group: '2枚片引き', label: '3方枠' },
    { id: 'sliding_kata_2_2way', group: '2枚片引き', label: '2方枠' },
    { id: 'sliding_kata_3_3way', group: '3枚片引き', label: '3方枠' },
    { id: 'sliding_kata_3_2way', group: '3枚片引き', label: '2方枠' },
    { id: 'sliding_4_3way', group: '4枚引き違い', label: '3方枠' },
    { id: 'sliding_4_2way', group: '4枚引き違い', label: '2方枠' },
    { id: 'double_3way', group: '両開き戸', label: '3方枠' },
    { id: 'double_2way', group: '両開き戸', label: '2方枠' },
    { id: 'folding_2_3way', group: '2枚折戸', label: '3方枠' },
    { id: 'folding_2_2way', group: '2枚折戸', label: '2方枠' },
    { id: 'folding_4_3way', group: '4枚折戸', label: '3方枠' },
    { id: 'folding_4_2way', group: '4枚折戸', label: '2方枠' },
    { id: 'folding_6_3way', group: '6枚折戸', label: '3方枠' },
    { id: 'folding_6_2way', group: '6枚折戸', label: '2方枠' },
    { id: 'folding_8_3way', group: '8枚折戸', label: '3方枠' },
    { id: 'folding_8_2way', group: '8枚折戸', label: '2方枠' },
    { id: 'hinged_storage_3way', group: '片開き物入', label: '3方枠' },
    { id: 'hinged_storage_2way', group: '片開き物入', label: '2方枠' },
];

export const DEFAULT_DIMENSION_SETTINGS: DimensionSettings = {
    "hinged_3way": { "frameOuterW": "W", "frameInnerW": "W-48", "doorW": "W-56", "frameOuterH": "H+24", "frameInnerH": "H", "doorH": "H-17", "railLength": "" },
    "hinged_2way": { "frameOuterW": "W", "frameInnerW": "W-48", "doorW": "W-56", "frameOuterH": "H+27.5", "frameInnerH": "H", "doorH": "H-20", "railLength": "" },
    "sliding_outset_normal": { "frameOuterW": "W", "frameInnerW": "W-22", "doorW": "W+18", "frameOuterH": "H", "frameInnerH": "H-29", "doorH": "H-29", "railLength": "(W*2) +16" },
    "sliding_outset_lock": { "frameOuterW": "W", "frameInnerW": "W-48", "doorW": "W+5", "frameOuterH": "H", "frameInnerH": "H-29", "doorH": "H-29", "railLength": "(W*2) -14" },
    "sliding_outset_corner": { "frameOuterW": "W", "frameInnerW": "W-22", "doorW": "W+2", "frameOuterH": "H", "frameInnerH": "H-29", "doorH": "H-29", "railLength": "(W*2) -20" },
    "sliding_outset_corner_lock": { "frameOuterW": "W", "frameInnerW": "W-48", "doorW": "W-19", "frameOuterH": "H", "frameInnerH": "H-29", "doorH": "H-29", "railLength": "(W*2) -14" },
};

export const DEFAULT_MATRIX_PRICES: MatrixPrices = {
    "hinged_2w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 24700,
      "h2200": 27300,
      "h2400": 28200,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KB3H2400.pdf"
    },
    "hinged_2w_l": {
      "h90": 0,
      "h120": 0,
      "h2000": 26900,
      "h2200": 29600,
      "h2400": 30600,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KB4H2400.pdf"
    },
    "hinged_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 24700,
      "h2200": 27300,
      "h2400": 28200,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KB2000.pdf"
    },
    "hinged_3w_l": {
      "h90": 0,
      "h120": 0,
      "h2000": 26900,
      "h2200": 29600,
      "h2400": 30600,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KB2200key.pdf"
    },
    "sliding-inset_2w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 28800,
      "h2200": 30300,
      "h2400": 31200,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KHinset2400.pdf"
    },
    "sliding-inset_2w_l": {
      "h90": 0,
      "h120": 0,
      "h2000": 32900,
      "h2200": 34600,
      "h2400": 35500,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KHinset2400key.pdf"
    },
    "sliding-inset_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 28800,
      "h2200": 30300,
      "h2400": 31200,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KHinset2000.pdf"
    },
    "sliding-inset_3w_l": {
      "h90": 0,
      "h120": 0,
      "h2000": 32900,
      "h2200": 34600,
      "h2400": 35500,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KHinset2000key.pdf"
    },
    "sliding-outset_2w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 26600,
      "h2200": 26600,
      "h2400": 26600,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2400.pdf"
    },
    "sliding-outset_2w_l": {
      "h90": 0,
      "h120": 0,
      "h2000": 34400,
      "h2200": 34400,
      "h2400": 34400,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2400key.pdf"
    },
    "sliding-outset_2w_c": {
      "h90": 0,
      "h120": 0,
      "h2000": 27000,
      "h2200": 27000,
      "h2400": 27000,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2400IZ.pdf"
    },
    "sliding-outset_2w_cl": {
      "h90": 0,
      "h120": 0,
      "h2000": 32800,
      "h2200": 32800,
      "h2400": 32800,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2400IZkey.pdf"
    },
    "sliding-outset_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 33300,
      "h2200": 26600,
      "h2400": 26600,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2000.pdf"
    },
    "sliding-outset_3w_l": {
      "h90": 0,
      "h120": 0,
      "h2000": 40700,
      "h2200": 34400,
      "h2400": 34400,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2000key.pdf"
    },
    "sliding-outset_3w_c": {
      "h90": 0,
      "h120": 0,
      "h2000": 33700,
      "h2200": 27000,
      "h2400": 27000,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2000IZ.pdf"
    },
    "sliding-outset_3w_cl": {
      "h90": 0,
      "h120": 0,
      "h2000": 39200,
      "h2200": 32800,
      "h2400": 32800,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HKoutset2000IZkey.pdf"
    },
    "sliding-hikikomi_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 32200,
      "h2200": 33500,
      "h2400": 34400,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HIKIKOMI.pdf"
    },
    "sliding-2_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 47100,
      "h2200": 49200,
      "h2400": 51100,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HT1.pdf"
    },
    "sliding-3_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 0,
      "h2200": 0,
      "h2400": 0,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HT3.pdf"
    },
    "sliding-4_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 91700,
      "h2200": 95300,
      "h2400": 98900,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/HT4.pdf"
    },
    "sliding-kata-2_L": {
      "h90": 0,
      "h120": 0,
      "h2000": 59300,
      "h2200": 61600,
      "h2400": 63400,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH2maihikikomi.pdf"
    },
    "sliding-kata-2_R": {
      "h90": 0,
      "h120": 0,
      "h2000": 59300,
      "h2200": 61600,
      "h2400": 63400,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH2maihikikomi.pdf"
    },
    "sliding-kata-3_L": {
      "h90": 0,
      "h120": 0,
      "h2000": 85800,
      "h2200": 88900,
      "h2400": 91700,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH3maihikikomi.pdf"
    },
    "sliding-kata-3_R": {
      "h90": 0,
      "h120": 0,
      "h2000": 85800,
      "h2200": 88900,
      "h2400": 91700,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/KH3maihikikomi.pdf"
    },
    "double_w73.5": {
      "h90": 12000,
      "h120": 13800,
      "h2000": 20400,
      "h2200": 22000,
      "h2400": 22900,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/RBH2400.pdf"
    },
    "double_w120": {
      "h90": 0,
      "h120": 0,
      "h2000": 0,
      "h2200": 0,
      "h2400": 0,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/RBH2400.pdf"
    },
    "folding-2_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 16200,
      "h2200": 17200,
      "h2400": 17500,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OREDO2.pdf"
    },
    "folding-4_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 28800,
      "h2200": 30200,
      "h2400": 30800,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OR4mai.pdf"
    },
    "folding-6_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 51600,
      "h2200": 53700,
      "h2400": 54700,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OREDO6.pdf"
    },
    "folding-8_3w_nl": {
      "h90": 0,
      "h120": 0,
      "h2000": 66700,
      "h2200": 69300,
      "h2400": 70700,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/OREDO8.pdf"
    },
    "hinged-storage_3w_nl": {
      "h90": 7700,
      "h120": 9000,
      "h2000": 12800,
      "h2200": 13900,
      "h2400": 14300,
      "url": "http://25663cc9bda9549d.main.jp/aistudio/door/PDFsyousai/MO2000.pdf"
    }
  };
