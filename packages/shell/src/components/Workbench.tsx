import type { FC } from 'react';
import type { WorkbenchProps } from '../types';

export const Workbench: FC<WorkbenchProps> = ({
  titleBar,
  activityBar,
  sidebar,
  sidebarCollapsed = false,
  tabs,
  panel,
  statusBar,
  children,
}) => {
  const sidebarClass = sidebarCollapsed
    ? 'vsc-workbench__sidebar is-collapsed'
    : 'vsc-workbench__sidebar';

  return (
    <div className="vsc-workbench">
      {titleBar != null ? titleBar : null}
      <div className="vsc-workbench__body">
        {activityBar}
        {sidebar != null ? (
          <div className={sidebarClass} aria-hidden={sidebarCollapsed || undefined}>
            {sidebar}
          </div>
        ) : null}
        <div className="vsc-workbench__main">
          {tabs}
          <main className="vsc-workbench__editor">{children}</main>
          {panel != null ? <div className="vsc-workbench__panel">{panel}</div> : null}
        </div>
      </div>
      {statusBar}
    </div>
  );
};
