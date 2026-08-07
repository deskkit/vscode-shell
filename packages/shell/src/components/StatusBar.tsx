import type { FC } from 'react';
import type { StatusBarProps } from '../types';

export const StatusBar: FC<StatusBarProps> = ({
  left,
  center,
  right,
  showThemeToggle,
  theme = 'dark',
  onThemeChange,
}) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <footer className="vsc-status-bar">
      <div className="vsc-status-bar__left">{left}</div>
      <div className="vsc-status-bar__center">{center}</div>
      <div className="vsc-status-bar__right">
        {right}
        {showThemeToggle ? (
          <button
            type="button"
            className="vsc-status-bar__theme"
            aria-label={`Switch to ${next} theme`}
            onClick={() => onThemeChange?.(next)}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        ) : null}
      </div>
    </footer>
  );
};
