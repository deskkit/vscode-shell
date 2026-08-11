import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Workbench } from './Workbench';

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
});
