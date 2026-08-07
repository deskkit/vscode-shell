import type { FC } from 'react';
import type { SidebarItem, SidebarProps } from '../types';

export const Sidebar: FC<SidebarProps> = ({
  title,
  items,
  activeId,
  onChange,
  width = 192,
  footer,
}) => {
  const renderItems = (list: SidebarItem[], depth = 0) =>
    list.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      if (hasChildren) {
        return (
          <div key={item.id} className="vsc-sidebar__group">
            <div className="vsc-sidebar__group-label" style={{ paddingLeft: 12 + depth * 12 }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {renderItems(item.children!, depth + 1)}
          </div>
        );
      }
      const isActive = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          className={`vsc-sidebar__item${isActive ? ' is-active' : ''}`}
          style={{ paddingLeft: 12 + depth * 12 }}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      );
    });

  return (
    <aside className="vsc-sidebar" style={{ width }}>
      {title ? <div className="vsc-sidebar__title">{title}</div> : null}
      <nav className="vsc-sidebar__nav">{renderItems(items)}</nav>
      {footer ? <div className="vsc-sidebar__footer">{footer}</div> : null}
    </aside>
  );
};
