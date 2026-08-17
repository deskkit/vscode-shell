import type { FC } from 'react';
import type { SidebarItem, SidebarProps } from '../types';
import { Scrollbar } from './Scrollbar';

/** 分区标题与叶子项统一左内边距（不做树形逐级缩进） */
const ITEM_PAD = 12;

export const Sidebar: FC<SidebarProps> = ({
  title,
  items,
  activeId,
  onChange,
  width = 192,
  footer,
}) => {
  const renderItems = (list: SidebarItem[]) =>
    list.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      if (hasChildren) {
        return (
          <div key={item.id} className="vsc-sidebar__group">
            <div
              className="vsc-sidebar__group-label"
              style={{ paddingLeft: ITEM_PAD }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
            {renderItems(item.children!)}
          </div>
        );
      }
      const isActive = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          className={`vsc-sidebar__item${isActive ? ' is-active' : ''}`}
          style={{ paddingLeft: ITEM_PAD }}
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
      <div className="vsc-sidebar__nav">
        <Scrollbar
          orientation="vertical"
          className="vsc-sidebar__scroll"
          contentKey={JSON.stringify(items)}
        >
          {renderItems(items)}
        </Scrollbar>
      </div>
      {footer ? <div className="vsc-sidebar__footer">{footer}</div> : null}
    </aside>
  );
};
