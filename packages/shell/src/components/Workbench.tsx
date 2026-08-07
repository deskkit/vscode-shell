import type { FC } from 'react';
import type { WorkbenchProps } from '../types';

export const Workbench: FC<WorkbenchProps> = ({
  activityBar,
  sidebar,
  tabs,
  statusBar,
  children,
}) => {
  return (
    <div className="vsc-workbench">
      <div className="vsc-workbench__body">
        {activityBar}
        {sidebar != null ? <div className="vsc-workbench__sidebar">{sidebar}</div> : null}
        <div className="vsc-workbench__main">
          {tabs}
          <main className="vsc-workbench__editor">{children}</main>
        </div>
      </div>
      {statusBar}
    </div>
  );
};
