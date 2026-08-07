import type { FC } from 'react';
import type { ActivityBarProps, ActivityItem } from '../types';

export const ActivityBar: FC<ActivityBarProps> = ({
  items,
  activeId,
  onChange,
  logo,
  onLogoClick,
}) => {
  const top = items.filter((i) => (i.position ?? 'top') === 'top');
  const bottom = items.filter((i) => i.position === 'bottom');

  const renderItem = (item: ActivityItem) => {
    const isActive = item.id === activeId;
    return (
      <button
        key={item.id}
        type="button"
        title={item.label}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        className={`vsc-activity-bar__item${isActive ? ' is-active' : ''}`}
        onClick={() => onChange(item.id)}
      >
        {isActive ? <span className="vsc-activity-bar__indicator" /> : null}
        <span className="vsc-activity-bar__icon">{item.icon}</span>
      </button>
    );
  };

  return (
    <div className="vsc-activity-bar">
      {logo ? (
        <button
          type="button"
          title="Home logo"
          aria-label="Home logo"
          className="vsc-activity-bar__logo"
          onClick={onLogoClick}
        >
          {logo}
        </button>
      ) : null}
      <div className="vsc-activity-bar__top">{top.map(renderItem)}</div>
      <div className="vsc-activity-bar__bottom">{bottom.map(renderItem)}</div>
    </div>
  );
};
