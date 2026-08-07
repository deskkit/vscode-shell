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
});
