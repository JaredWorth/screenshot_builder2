import { BAR_H, BOARD_H, BOARD_W, DEFAULT_TIME, FH, FW, PT, SCR, type BuilderState, type Phone, type RGB } from './model';
import { lum, resample, rgb, sharpen } from './image';

export interface Assets { frame: HTMLImageElement; mask: HTMLImageElement }

export interface Slot { p: Phone; i: number; x: number; y: number; w: number; h: number; k: number; land: boolean }

const PLACEHOLDER: RGB = [226, 232, 240];

export function layout(s: BuilderState): Slot[] {
  if (s.mode === 'landscape') {
    const w = BOARD_W * s.lsize / 100, h = w * FW / FH;
    return [{ p: s.phones[0], i: 0, x: (BOARD_W - w) / 2, y: (BOARD_H - h) / 2, w, h, k: w / FH, land: true }];
  }
  const vis = s.phones.map((p, i) => ({ p, i })).filter((o) => o.p.visible);
  const ph = BOARD_H * s.size / 100, pw = ph * FW / FH, gap = s.gap;
  const total = vis.length * pw + Math.max(0, vis.length - 1) * gap;
  const x0 = (BOARD_W - total) / 2, y0 = (BOARD_H - ph) / 2;
  return vis.map((o, k) => ({ ...o, x: x0 + k * (pw + gap), y: y0, w: pw, h: ph, k: ph / FH, land: false }));
}

export function compose(ctx: CanvasRenderingContext2D, scale: number, preview: boolean, s: BuilderState, a: Assets) {
  const time = s.time.trim() || DEFAULT_TIME;
  for (const L of layout(s)) {
    const off = renderPhone(L.p, L.k * scale, preview, L.land, a, time);
    ctx.drawImage(off, Math.round(L.x * scale), Math.round(L.y * scale));
  }
}

// Draws one phone at frame scale K: screenshot clipped to the screen, optional bars, then mask and frame on top.
// Landscape renders the portrait frame rotated -90° (notch on the left).
function renderPhone(p: Phone, K: number, preview: boolean, land: boolean, a: Assets, time: string) {
  const c = document.createElement('canvas');
  const pw = Math.round(FW * K), ph = Math.round(FH * K);
  c.width = land ? ph : pw; c.height = land ? pw : ph;
  const x = c.getContext('2d', { willReadFrequently: !preview })!; x.imageSmoothingQuality = 'high';
  const sx = (land ? SCR.y : SCR.x) * K, sy = (land ? FW - SCR.x - SCR.w : SCR.y) * K;
  const sw = (land ? SCR.h : SCR.w) * K, sh = (land ? SCR.w : SCR.h) * K;
  const cx = sx + sw / 2, cy = sy + sh / 2;
  if (land) p = { ...p, statusBar: false };
  const overlay = (img: HTMLImageElement) => {
    x.save();
    if (land) { x.translate(0, c.height); x.rotate(-Math.PI / 2); }
    x.drawImage(resample(img, pw, ph), 0, 0, pw, ph);
    x.restore();
  };
  const barCol: RGB = p.barMode === 'dark' ? [0, 0, 0] : p.barMode === 'light' ? [255, 255, 255] : p.top;
  if (p.img) {
    const barH = p.statusBar ? BAR_H * K : 0;
    x.fillStyle = rgb(p.bot); x.fillRect(sx, sy, sw, sh);
    const dw = sw * p.zoom / 100, dh = p.img.naturalHeight * dw / p.img.naturalWidth;
    const areaH = sh - barH;
    x.save(); x.beginPath(); x.rect(sx, sy + barH, sw, areaH); x.clip();
    x.drawImage(resample(p.img, dw, dh), sx + (sw - dw) / 2, sy + barH + sh * p.pos / 100, dw, dh);
    x.restore();
    if (!preview) sharpen(x, sx, sy + barH, sw, areaH, 0.18);
    if (p.statusBar) { x.fillStyle = rgb(barCol); x.fillRect(sx, sy, sw, barH + 1); }
  } else {
    x.fillStyle = rgb(PLACEHOLDER); x.fillRect(sx, sy, sw, sh);
    if (preview) {
      x.fillStyle = 'rgb(100,116,139)'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `600 ${Math.round(30 * K)}px Inter, sans-serif`;
      x.fillText(land ? 'Drop landscape screenshot' : 'Drop screenshot', cx, cy);
      x.font = `400 ${Math.round(22 * K)}px Inter, sans-serif`;
      x.fillText(p.label, cx, cy + 44 * K);
    }
  }
  if (p.statusBar) drawStatus(x, K, time, lum(p.img ? barCol : PLACEHOLDER) > 0.6 ? '#000' : '#fff');
  if (p.homeInd) {
    const hw = 134 * PT * K, hh = 5 * PT * K;
    x.fillStyle = lum(p.img ? p.bot : PLACEHOLDER) > 0.6 ? '#000' : '#fff';
    x.beginPath(); x.roundRect(cx - hw / 2, sy + sh - 8 * PT * K - hh, hw, hh, hh / 2); x.fill();
  }
  x.globalCompositeOperation = 'destination-in'; overlay(a.mask);
  x.globalCompositeOperation = 'source-over'; overlay(a.frame);
  return c;
}

// iOS status bar (time, signal, wifi, battery) in points, positioned to sit either side of the notch.
function drawStatus(x: CanvasRenderingContext2D, K: number, time: string, col: string) {
  const u = PT * K, cy = 69 * K;
  x.fillStyle = col; x.strokeStyle = col;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `600 ${17 * u}px -apple-system, "SF Pro Text", Inter, sans-serif`;
  x.fillText(time, 133 * K, cy + 0.5 * u);
  let left = 503 * K;
  [4, 6.3, 8.7, 11].forEach((h, i) => { x.beginPath(); x.roundRect(left + i * 4.7 * u, cy + 5.5 * u - h * u, 3 * u, h * u, 0.9 * u); x.fill(); });
  left += 18.4 * u + 5 * u;
  const wx = left + 7.7 * u, wy = cy + 5.6 * u;
  x.lineCap = 'round'; x.lineWidth = 2.1 * u;
  [9.6, 5.8].forEach((r) => { x.beginPath(); x.arc(wx, wy, r * u, Math.PI * 1.25, Math.PI * 1.75); x.stroke(); });
  x.beginPath(); x.moveTo(wx, wy); x.arc(wx, wy, 3 * u, Math.PI * 1.25, Math.PI * 1.75); x.closePath(); x.fill();
  left += 15.4 * u + 5 * u;
  const bw = 24.3 * u, bh = 11.3 * u, by = cy - bh / 2;
  x.globalAlpha = 0.35; x.lineWidth = 1 * u;
  x.beginPath(); x.roundRect(left + 0.5 * u, by + 0.5 * u, bw - 1 * u, bh - 1 * u, 3.2 * u); x.stroke();
  x.globalAlpha = 0.4; x.beginPath(); x.roundRect(left + bw + 0.8 * u, cy - 2 * u, 1.4 * u, 4 * u, 0.7 * u); x.fill();
  x.globalAlpha = 1; x.beginPath(); x.roundRect(left + 2 * u, by + 2 * u, bw - 4 * u, bh - 4 * u, 1.6 * u); x.fill();
}

export function exportWebp(s: BuilderState, a: Assets, size: { w: number; h: number }, quality: number) {
  const c = document.createElement('canvas'); c.width = size.w; c.height = size.h;
  compose(c.getContext('2d')!, c.width / BOARD_W, false, s, a);
  return new Promise<Blob | null>((res) => c.toBlob(res, 'image/webp', quality));
}
