import type { FC, ReactNode } from 'react';
import type { StatusBarProps } from '../types';

function SunIcon() {
  return (
    <svg className="vsc-status-bar__theme-icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="8" y1="1" x2="8" y2="2.5" />
        <line x1="8" y1="13.5" x2="8" y2="15" />
        <line x1="1" y1="8" x2="2.5" y2="8" />
        <line x1="13.5" y1="8" x2="15" y2="8" />
        <line x1="3.05" y1="3.05" x2="4.1" y2="4.1" />
        <line x1="11.9" y1="11.9" x2="12.95" y2="12.95" />
        <line x1="3.05" y1="12.95" x2="4.1" y2="11.9" />
        <line x1="11.9" y1="4.1" x2="12.95" y2="3.05" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="vsc-status-bar__theme-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.2 1.4a6.6 6.6 0 0 0 8.4 8.4A6.7 6.7 0 1 1 6.2 1.4z"
      />
    </svg>
  );
}

export const StatusBar: FC<StatusBarProps> = ({
  left,
  center,
  right,
  showThemeToggle,
  theme = 'dark',
  onThemeChange,
}) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  const icon: ReactNode = theme === 'dark' ? <SunIcon /> : <MoonIcon />;

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
            title={`Switch to ${next} theme`}
            onClick={() => onThemeChange?.(next)}
          >
            {icon}
          </button>
        ) : null}
      </div>
    </footer>
  );
};
