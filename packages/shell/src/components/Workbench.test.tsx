import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Workbench } from './Workbench';
import { Sidebar } from './Sidebar';

describe('Workbench', () => {
  it('renders chrome slots and children', () => {
    render(
      <Workbench
        activityBar={<div>AB</div>}
        sidebar={<div>SB</div>}
        tabs={<div>TABS</div>}
        statusBar={<div>STATUS</div>}
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getByText('SB')).toBeInTheDocument();
    expect(screen.getByText('TABS')).toBeInTheDocument();
    expect(screen.getByText('EDITOR')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
  });

  it('hides sidebar column when sidebar is null', () => {
    const { container } = render(
      <Workbench activityBar={<div>AB</div>} sidebar={null}>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__sidebar')).toBeNull();
    expect(screen.getByText('EDITOR')).toBeInTheDocument();
  });

  it('renders titleBar as the first child when provided', () => {
    const { container } = render(
      <Workbench titleBar={<div data-testid="tb">TITLE</div>} activityBar={<div>AB</div>}>
        <div>EDITOR</div>
      </Workbench>,
    );
    const root = container.querySelector('.vsc-workbench');
    expect(root?.children[0]).toHaveAttribute('data-testid', 'tb');
    expect(root?.children[1]).toHaveClass('vsc-workbench__body');
  });

  it('keeps body as first child when titleBar is omitted', () => {
    const { container } = render(
      <Workbench activityBar={<div>AB</div>}>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench')?.children[0]).toHaveClass(
      'vsc-workbench__body',
    );
  });

  it('renders panel below editor when provided', () => {
    const { container } = render(
      <Workbench
        activityBar={<div>AB</div>}
        tabs={<div>TABS</div>}
        panel={<div>PANEL</div>}
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    const main = container.querySelector('.vsc-workbench__main');
    expect(main?.children[0].textContent).toBe('TABS');
    expect(main?.querySelector('.vsc-workbench__editor')?.textContent).toBe('EDITOR');
    expect(main?.querySelector('.vsc-workbench__panel')?.textContent).toBe('PANEL');
  });

  it('hides panel when omitted or null', () => {
    const { container, rerender } = render(
      <Workbench activityBar={<div>AB</div>}>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__panel')).toBeNull();
    rerender(
      <Workbench activityBar={<div>AB</div>} panel={null}>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__panel')).toBeNull();
  });

  it('adds is-collapsed when sidebarCollapsed is true', () => {
    const { container } = render(
      <Workbench
        activityBar={<div>AB</div>}
        sidebar={<div>SB</div>}
        sidebarCollapsed
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    const col = container.querySelector('.vsc-workbench__sidebar');
    expect(col).toHaveClass('is-collapsed');
    expect(col).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('SB')).toBeInTheDocument();
  });

  it('does not collapse when sidebarCollapsed is false', () => {
    const { container } = render(
      <Workbench
        activityBar={<div>AB</div>}
        sidebar={<div>SB</div>}
        sidebarCollapsed={false}
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    const col = container.querySelector('.vsc-workbench__sidebar');
    expect(col).not.toHaveClass('is-collapsed');
    expect(col).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('does not collapse when sidebarCollapsed is omitted', () => {
    const { container } = render(
      <Workbench activityBar={<div>AB</div>} sidebar={<div>SB</div>}>
        <div>EDITOR</div>
      </Workbench>,
    );
    const col = container.querySelector('.vsc-workbench__sidebar');
    expect(col).not.toHaveClass('is-collapsed');
    expect(col).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('collapses sidebar column width when Sidebar is present', () => {
    const style = document.createElement('style');
    style.textContent = `
      .vsc-workbench__body { display: flex; width: 400px; }
      .vsc-workbench__sidebar {
        display: flex;
        min-width: 0;
        max-width: 192px;
        overflow: hidden;
      }
      .vsc-workbench__sidebar.is-collapsed { max-width: 0; }
      .vsc-sidebar { flex-shrink: 0; display: flex; flex-direction: column; }
    `;
    document.head.appendChild(style);

    const { container } = render(
      <Workbench
        activityBar={<div style={{ width: 48, flexShrink: 0 }}>AB</div>}
        sidebar={
          <Sidebar
            items={[{ id: 'a', label: 'Item A' }]}
            activeId="a"
            onChange={() => {}}
          />
        }
        sidebarCollapsed
      >
        <div>EDITOR</div>
      </Workbench>,
    );

    const col = container.querySelector('.vsc-workbench__sidebar') as HTMLElement;
    expect(col).toHaveClass('is-collapsed');
    expect(Number.parseFloat(getComputedStyle(col).maxWidth)).toBe(0);
    expect(col.getBoundingClientRect().width).toBe(0);

    document.head.removeChild(style);
  });

  it('ignores sidebarCollapsed when sidebar is null', () => {
    const { container } = render(
      <Workbench activityBar={<div>AB</div>} sidebar={null} sidebarCollapsed>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__sidebar')).toBeNull();
  });
});
