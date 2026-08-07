import type { FC, MouseEvent } from 'react';
import type { PageTabsProps } from '../types';
import { Scrollbar } from './Scrollbar';

export const PageTabs: FC<PageTabsProps> = ({ tabs, activeId, onSelect, onClose }) => {
  return (
    <div className="vsc-page-tabs" role="tablist">
      <Scrollbar
        orientation="horizontal"
        className="vsc-page-tabs__scroll"
        viewportClassName="vsc-page-tabs__scroller"
        contentKey={tabs.map((t) => t.id).join('|')}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const showClose = tab.closable !== false && typeof onClose === 'function';
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`vsc-page-tabs__tab${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(tab.id)}
            >
              {tab.icon ? <span className="vsc-page-tabs__icon">{tab.icon}</span> : null}
              <span className="vsc-page-tabs__title">{tab.title}</span>
              {showClose ? (
                <button
                  type="button"
                  className="vsc-page-tabs__close"
                  aria-label={`Close ${tab.title}`}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    onClose(tab.id);
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </Scrollbar>
    </div>
  );
};
