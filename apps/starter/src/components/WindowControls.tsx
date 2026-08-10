import type { CSSProperties } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const btnStyle: CSSProperties = {
  border: 0,
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: '100%',
  minHeight: 32,
  padding: 0,
};

export function WindowControls() {
  const win = getCurrentWindow();

  return (
    <div className="starter-window-controls" style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
      <button
        type="button"
        className="starter-window-controls__btn"
        style={btnStyle}
        aria-label="Minimize"
        title="Minimize"
        onClick={() => void win.minimize()}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 5h8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <button
        type="button"
        className="starter-window-controls__btn"
        style={btnStyle}
        aria-label="Maximize"
        title="Maximize"
        onClick={() => void win.toggleMaximize()}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <button
        type="button"
        className="starter-window-controls__btn starter-window-controls__btn--close"
        style={btnStyle}
        aria-label="Close"
        title="Close"
        onClick={() => void win.close()}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}
