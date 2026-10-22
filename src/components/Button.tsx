import { useState, type CSSProperties, type ReactNode } from 'react';

// Local port of the Covers design-system Button (primary, md), so the app doesn't ship the full DS bundle.
const ORANGE = 'rgb(253,80,0)', ORANGE_HOVER = 'rgb(225,71,0)';

interface Props { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties }

export function Button({ children, onClick, disabled, style }: Props) {
  const [hov, setHov] = useState(false);
  const bg = disabled ? 'rgb(208,209,212)' : hov ? ORANGE_HOVER : ORANGE;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 40, padding: '0 12px', borderRadius: 4, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: bg, color: '#fff', boxShadow: `inset 0 0 0 1px ${bg}`,
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, lineHeight: '16.8px',
        whiteSpace: 'nowrap', boxSizing: 'border-box',
        transition: 'background-color .15s ease, box-shadow .15s ease, color .15s ease',
        ...style,
      }}
    >
      <span>{children}</span>
    </button>
  );
}
