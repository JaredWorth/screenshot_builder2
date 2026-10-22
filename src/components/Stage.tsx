import { useEffect, useRef, type DragEvent } from 'react';
import { BOARD_W, type BuilderState } from '../lib/model';
import { compose, layout, type Assets } from '../lib/render';

interface Props { state: BuilderState; assets: Assets | null; onFile: (index: number, file: File | undefined) => void }

// Live preview: redraws the canvas at device resolution on every state change and on resize.
export function Stage({ state, assets, onFile }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<() => void>(() => {});

  drawRef.current = () => {
    const cv = canvasRef.current, st = stageRef.current;
    if (!cv || !st || !assets) return;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.round(st.clientWidth * dpr), H = Math.round(W * 9 / 16);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const ctx = cv.getContext('2d')!; ctx.clearRect(0, 0, W, H);
    compose(ctx, W / BOARD_W, true, state, assets);
  };

  useEffect(() => { drawRef.current(); });

  useEffect(() => {
    const ro = new ResizeObserver(() => drawRef.current());
    if (stageRef.current) ro.observe(stageRef.current);
    document.fonts?.ready.then(() => drawRef.current());
    return () => ro.disconnect();
  }, []);

  // Drop on the stage goes to the phone whose centre is nearest the cursor.
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (state.mode === 'landscape') return onFile(0, file);
    const slots = layout(state); if (!slots.length) return;
    const r = stageRef.current!.getBoundingClientRect();
    const bx = (e.clientX - r.left) / r.width * BOARD_W;
    const hit = slots.reduce((a, b) => (Math.abs(b.x + b.w / 2 - bx) < Math.abs(a.x + a.w / 2 - bx) ? b : a));
    onFile(hit.i, file);
  };

  return (
    <main className="main">
      <div ref={stageRef} className="stage" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <canvas ref={canvasRef} className="stage__canvas" />
      </div>
    </main>
  );
}
