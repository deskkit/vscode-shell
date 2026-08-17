import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

const items = [
  { id: 'files', label: 'Files' },
  {
    id: 'group',
    label: 'Group',
    children: [{ id: 'child', label: 'Child' }],
  },
];

describe('Sidebar', () => {
  it('renders title and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Sidebar title="Explorer" items={items} activeId="files" onChange={onChange} />,
    );
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    await user.click(screen.getByText('Child'));
    expect(onChange).toHaveBeenCalledWith('child');
  });

  it('marks active leaf', () => {
    render(<Sidebar items={items} activeId="files" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Files' }).className).toContain('is-active');
  });

  it('keeps group children at the same indent as sibling leaves', () => {
    render(<Sidebar items={items} activeId="files" onChange={() => {}} />);
    const leaf = screen.getByRole('button', { name: 'Files' });
    const child = screen.getByRole('button', { name: 'Child' });
    expect(leaf.style.paddingLeft).toBe('12px');
    expect(child.style.paddingLeft).toBe('12px');
  });

  it('renders footer slot', () => {
    render(
      <Sidebar
        items={items}
        activeId="files"
        onChange={() => {}}
        footer={<div>Footer</div>}
      />,
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
