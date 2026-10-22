// Frame artwork is 689×1366; the screen rect and point scale are measured from it.
export const FW = 689, FH = 1366;
export const SCR = { x: 43, y: 29, w: 604, h: 1308 };
export const PT = 604 / 390;
export const BAR_H = 47 * PT;

// Layout is authored on a 1920×1080 board and scaled to the output.
export const BOARD_W = 1920, BOARD_H = 1080;
export const EXPORT = { w: 992, h: 558 };
export const EXPORT_HI = { w: 1504, h: 846 };
export const WEBP_QUALITY = 0.88;
export const DEFAULT_TIME = '9:41';

export type RGB = [number, number, number];
export type BarMode = 'auto' | 'dark' | 'light';
export type Mode = 'portrait' | 'landscape';

export interface Phone {
  visible: boolean;
  img: HTMLImageElement | null;
  name: string;
  thumb: string;
  statusBar: boolean;
  barMode: BarMode;
  homeInd: boolean;
  zoom: number;
  pos: number;
  top: RGB;
  bot: RGB;
  label: string;
}

export interface BuilderState {
  phones: Phone[];
  time: string;
  size: number;
  gap: number;
  retina: boolean;
  mode: Mode;
  lsize: number;
}

export const blankPhone = (i: number): Phone => ({
  visible: true, img: null, name: '', thumb: '', statusBar: false, barMode: 'auto', homeInd: false,
  zoom: 100, pos: 0, top: [0, 0, 0], bot: [255, 255, 255], label: 'Phone ' + (i + 1),
});

export const initialState = (): BuilderState => ({
  phones: [0, 1, 2].map(blankPhone), time: DEFAULT_TIME, size: 92, gap: 56, retina: true, mode: 'portrait', lsize: 86,
});

// Y position is a percentage of screen height; the range grows so tall or zoomed screenshots can reach their bottom edge.
export function posRange(p: Phone, land: boolean) {
  if (!p.img) return { min: -20, max: 20 };
  const barH = p.statusBar && !land ? BAR_H : 0;
  const W = land ? SCR.h : SCR.w, H = land ? SCR.w : SCR.h;
  const dh = W * p.zoom / 100 * p.img.naturalHeight / p.img.naturalWidth;
  const over = Math.max(0, dh - (H - barH));
  return { min: -Math.ceil(over / H * 100) - 10, max: 15 };
}

export function posLabel(p: Phone, land: boolean) {
  return (p.pos > 0 ? '+' : '') + Math.round(p.pos * (land ? SCR.w : SCR.h) / PT / 100) + 'pt';
}
