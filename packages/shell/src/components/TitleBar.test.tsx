import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TitleBar } from './TitleBar';

describe('TitleBar', () => {
  it('renders center and right slots', () => {
    render(<TitleBar center={<span>App</span>} right={<button type="button">Go</button>} />);
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('marks root and center as tauri drag regions', () => {
    const { container } = render(<TitleBar center="T" />);
    const root = container.querySelector('.vsc-titlebar');
    const center = container.querySelector('.vsc-titlebar__center');
    expect(root).toHaveAttribute('data-tauri-drag-region');
    expect(center).toHaveAttribute('data-tauri-drag-region');
  });

  it('marks right zone as no-drag', () => {
    const { container } = render(<TitleBar right={<button type="button">X</button>} />);
    const right = container.querySelector('.vsc-titlebar__right');
    expect(right).toHaveClass('vsc-titlebar__no-drag');
    expect(right).toHaveAttribute('data-tauri-drag-region', 'false');
  });

  it('renders empty zones without crashing when slots omitted', () => {
    const { container } = render(<TitleBar />);
    expect(container.querySelector('.vsc-titlebar')).toBeTruthy();
    expect(container.querySelector('.vsc-titlebar__left')).toBeTruthy();
    expect(container.querySelector('.vsc-titlebar__center')).toBeTruthy();
    expect(container.querySelector('.vsc-titlebar__right')).toBeTruthy();
  });

  it('renders left slot', () => {
    render(<TitleBar left={<button type="button">Toggle</button>} />);
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
  });

  it('marks left actions as no-drag', () => {
    const { container } = render(
      <TitleBar left={<button type="button">Toggle</button>} />,
    );
    const actions = container.querySelector('.vsc-titlebar__left-actions');
    expect(actions).toHaveClass('vsc-titlebar__no-drag');
    expect(actions).toHaveAttribute('data-tauri-drag-region', 'false');
  });
});
