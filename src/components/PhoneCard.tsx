import { useState, type DragEvent } from 'react';
import { posLabel, posRange, type BarMode, type Phone } from '../lib/model';

const BAR_MODES: [BarMode, string][] = [['auto', 'Match'], ['dark', 'Dark'], ['light', 'Light']];

interface Props {
  phone: Phone;
  land: boolean;
  canHide: boolean;
  onChange: (patch: Partial<Phone>) => void;
  onFile: (file: File | undefined) => void;
}

export function PhoneCard({ phone: p, land, canHide, onChange, onFile }: Props) {
  const [over, setOver] = useState(false);
  const visible = land || p.visible;
  const range = posRange(p, land);
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]); };

  return (
    <div className="card">
      <label className="card-head">
        <span className="eyebrow">{land ? 'Phone' : p.label}</span>
        {!land && (
          <span className="card-head__show">
            Show
            <input
              type="checkbox"
              checked={p.visible}
              onChange={(e) => { if (e.target.checked || canHide) onChange({ visible: e.target.checked }); }}
            />
          </span>
        )}
      </label>
      {visible && (
        <div className="card-body">
          <label
            className={'drop' + (over ? ' drop--over' : '')}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            <input className="drop__input" type="file" accept="image/*" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
            {p.img && <div className="drop__thumb" style={{ backgroundImage: `url("${p.thumb}")` }} />}
            <span className="drop__text">
              <span className="drop__cta">{p.img ? 'Replace screenshot' : 'Upload screenshot'}</span>
              <span className="drop__info">{p.img ? `${p.name} • ${p.img.naturalWidth}×${p.img.naturalHeight}` : 'PNG or JPG, or drag it here'}</span>
            </span>
          </label>
          {!land && (
            <label className="check check--top">
              <input type="checkbox" checked={p.statusBar} onChange={(e) => onChange({ statusBar: e.target.checked })} />
              <span className="check__text"><span>Add status bar</span><span className="hint">For screenshots cropped without the time / battery row</span></span>
            </label>
          )}
          {!land && p.statusBar && (
            <div className="bar-modes">
              <span className="hint">Bar colour</span>
              <div className="segmented">
                {BAR_MODES.map(([k, label]) => (
                  <button key={k} type="button" className={'segmented__btn' + (p.barMode === k ? ' segmented__btn--on' : '')} onClick={() => onChange({ barMode: k })}>{label}</button>
                ))}
              </div>
            </div>
          )}
          <label className="check">
            <input type="checkbox" checked={p.homeInd} onChange={(e) => onChange({ homeInd: e.target.checked })} />
            <span>Add home indicator</span>
          </label>
          {p.img && (
            <div className="sliders">
              <label className="slider slider--small">
                <span className="slider__head"><span>Zoom</span><span className="slider__value mono">{p.zoom}%</span></span>
                <input type="range" min={100} max={160} step={1} value={p.zoom} onChange={(e) => onChange({ zoom: +e.target.value })} />
              </label>
              <label className="slider slider--small">
                <span className="slider__head"><span>Y position</span><span className="slider__value mono">{posLabel(p, land)}</span></span>
                <input type="range" min={range.min} max={range.max} step={0.5} value={p.pos} onChange={(e) => onChange({ pos: +e.target.value })} />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
