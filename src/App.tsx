import { useEffect, useRef, useState } from 'react';
import { Logo } from './components/Logo';
import { PhoneCard } from './components/PhoneCard';
import { Stage } from './components/Stage';
import { loadImage, sample } from './lib/image';
import { EXPORT, EXPORT_HI, WEBP_QUALITY, initialState, type BuilderState, type Mode, type Phone } from './lib/model';
import { exportWebp, type Assets } from './lib/render';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export function App() {
  const [s, setS] = useState<BuilderState>(initialState);
  const [assets, setAssets] = useState<Assets | null>(null);
  const thumbs = useRef<string[]>([]);
  const land = s.mode === 'landscape';
  const out = s.retina ? EXPORT_HI : EXPORT;
  const visCount = s.phones.filter((p) => p.visible).length;

  useEffect(() => {
    Promise.all([loadImage(asset('phone-frame.png')), loadImage(asset('phone-screen-mask.png'))])
      .then(([frame, mask]) => setAssets({ frame, mask }));
  }, []);

  const set = (patch: Partial<BuilderState>) => setS((prev) => ({ ...prev, ...patch }));
  const setPhone = (i: number, patch: Partial<Phone>) =>
    setS((prev) => ({ ...prev, phones: prev.phones.map((p, k) => (k === i ? { ...p, ...patch } : p)) }));

  // Screenshots shorter than ~2:1 are assumed to be cropped below the status bar, so the bar is ticked for them.
  const loadFile = (i: number, file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    loadImage(url).then((img) => {
      if (thumbs.current[i]) URL.revokeObjectURL(thumbs.current[i]);
      thumbs.current[i] = url;
      setPhone(i, {
        img, name: file.name, thumb: url, top: sample(img, true), bot: sample(img, false),
        statusBar: img.naturalHeight / img.naturalWidth < 2.0, zoom: 100, pos: 0, visible: true,
      });
    }, () => URL.revokeObjectURL(url));
  };

  const onExport = async () => {
    if (!assets) return;
    const blob = await exportWebp(s, assets, out, WEBP_QUALITY);
    if (!blob) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `phone-mockup-${land ? 'horizontal-' : ''}${out.w}x${out.h}${s.retina ? '@1.5x' : ''}.webp`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const size = land ? s.lsize : s.size;

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo"><Logo className="header__mark" /></div>
        <div className="header__text">
          <div className="header__title">Phone Mockup Builder</div>
          <div className="eyebrow">SCREENSHOTS IN · TRANSPARENT WEBP OUT</div>
        </div>
      </header>
      <div className="body">
      <aside className="sidebar">
        <div className="section">
          <span className="eyebrow">FORMAT</span>
          <select className="select" value={s.mode} onChange={(e) => set({ mode: e.target.value as Mode })}>
            <option value="portrait">Portrait • up to 3 phones</option>
            <option value="landscape">Horizontal • 1 phone</option>
          </select>
        </div>
        {(land ? s.phones.slice(0, 1) : s.phones).map((p, i) => (
          <PhoneCard
            key={i}
            phone={p}
            land={land}
            canHide={visCount > 1}
            onChange={(patch) => setPhone(i, patch)}
            onFile={(file) => loadFile(i, file)}
          />
        ))}
        <div className="section section--layout">
          <span className="eyebrow">LAYOUT</span>
          <label className="field">
            <span>Status bar time</span>
            <input className="field__input" type="text" value={s.time} placeholder="9:41" onChange={(e) => set({ time: e.target.value })} />
          </label>
          <label className="slider">
            <span className="slider__head"><span>Phone size</span><span className="mono">{size}%</span></span>
            <input type="range" min={50} max={96} step={1} value={size} onChange={(e) => set(land ? { lsize: +e.target.value } : { size: +e.target.value })} />
          </label>
          {!land && (
            <label className="slider">
              <span className="slider__head"><span>Spacing</span><span className="mono">{s.gap}px</span></span>
              <input type="range" min={0} max={240} step={4} value={s.gap} onChange={(e) => set({ gap: +e.target.value })} />
            </label>
          )}
        </div>
        <div className="footer">
          <label className="check check--top">
            <input type="checkbox" checked={s.retina} onChange={(e) => set({ retina: e.target.checked })} />
            <span className="check__text"><span>Export @1.5x (high-res)</span><span className="hint">1.5× resolution — display at 992px wide for sharp text</span></span>
          </label>
          <button type="button" className="export-btn" onClick={onExport} disabled={!assets}>Export WebP</button>
          <span className="footer__info">{out.w} × {out.h} • 16:9 • WebP {Math.round(WEBP_QUALITY * 100)}% • transparent</span>
        </div>
      </aside>
      <Stage state={s} assets={assets} onFile={loadFile} />
      </div>
    </div>
  );
}
