import type { RGB } from './model';

type Source = HTMLImageElement | HTMLCanvasElement;

export function lum(c: RGB) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
export function rgb(c: RGB) { return `rgb(${c[0]},${c[1]},${c[2]})`; }

// Average colour of a thin strip at the top or bottom edge, used for bar colour and screen fill.
export function sample(img: HTMLImageElement, fromTop: boolean): RGB {
  const c = document.createElement('canvas'); c.width = 40; c.height = 40;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const sh = Math.max(1, Math.round(img.naturalHeight * 0.015));
  x.drawImage(img, 0, fromTop ? 0 : img.naturalHeight - sh, img.naturalWidth, sh, 0, 0, 40, 40);
  const d = x.getImageData(0, 0, 40, 40).data; let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4; return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

// Downscale in halving steps; a single large jump is what made exports blurry.
const rsCache = new WeakMap<Source, Record<string, HTMLCanvasElement>>();
export function resample(img: Source, tw: number, th: number): Source {
  tw = Math.max(1, Math.round(tw)); th = Math.max(1, Math.round(th));
  let w = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  let h = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  if (tw >= w) return img;
  const key = tw + 'x' + th; let m = rsCache.get(img);
  if (!m) { m = {}; rsCache.set(img, m); }
  if (m[key]) return m[key];
  let src: Source = img;
  while (w / 2 >= tw * 1.0001) {
    const nw = Math.round(w / 2), nh = Math.round(h / 2);
    const c = document.createElement('canvas'); c.width = nw; c.height = nh;
    const x = c.getContext('2d')!; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, nw, nh);
    src = c; w = nw; h = nh;
  }
  const c = document.createElement('canvas'); c.width = tw; c.height = th;
  const x = c.getContext('2d')!; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, tw, th);
  m[key] = c; return c;
}

// Light unsharp pass on the screen area, export only.
export function sharpen(ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, amt: number) {
  x0 = Math.floor(x0); y0 = Math.floor(y0); w = Math.ceil(w); h = Math.ceil(h);
  const id = ctx.getImageData(x0, y0, w, h), s = id.data, o = new Uint8ClampedArray(s);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4;
    for (let c = 0; c < 3; c++) {
      o[i + c] = s[i + c] * (1 + 4 * amt) - amt * (s[i + c - 4] + s[i + c + 4] + s[i + c - w * 4] + s[i + c + w * 4]);
    }
  }
  id.data.set(o); ctx.putImageData(id, x0, y0);
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
}
