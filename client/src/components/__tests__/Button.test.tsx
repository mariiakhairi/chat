import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button Component', () => {
  it('renders as a button element by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders with asChild prop using Slot', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies button styles when using asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Styled Link</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Styled Link' });
    expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    let button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button with Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
