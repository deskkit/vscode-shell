import type { FC } from 'react';
import type { TitleBarProps } from '../types';

export const TitleBar: FC<TitleBarProps> = ({ center, right, className }) => {
  const rootClass = className ? `vsc-titlebar ${className}` : 'vsc-titlebar';

  return (
    <header className={rootClass} data-tauri-drag-region>
      <div className="vsc-titlebar__left" aria-hidden="true" />
      <div className="vsc-titlebar__center">{center}</div>
      <div
        className="vsc-titlebar__right vsc-titlebar__no-drag"
        data-tauri-drag-region="false"
      >
        {right}
      </div>
    </header>
  );
};
