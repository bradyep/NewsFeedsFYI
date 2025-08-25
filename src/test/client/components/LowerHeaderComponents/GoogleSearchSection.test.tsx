import { render, screen } from '@testing-library/react';
import { GoogleSearchSection } from '../../../../client/components/LowerHeaderComponents/GoogleSearchSection';

describe('GoogleSearchSection Component', () => {
  it('should render search input with placeholder', () => {
    // Act
    render(<GoogleSearchSection />);

    // Assert
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should render search icon', () => {
    // Act
    const { container } = render(<GoogleSearchSection />);

    // Assert
    const searchIcon = container.querySelector('.fa-search');
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toHaveClass('fa', 'fa-search');
  });

  it('should be wrapped in a form element', () => {
    // Act
    const { container } = render(<GoogleSearchSection />);

    // Assert
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should have correct Bootstrap classes', () => {
    // Act
    const { container } = render(<GoogleSearchSection />);
    const wrapper = container.firstChild as HTMLElement;

    // Assert
    expect(wrapper).toHaveClass('col-md-6', 'mb-2');
  });

  it('should have InputGroup with correct size', () => {
    // Act
    const { container } = render(<GoogleSearchSection />);

    // Assert
    expect(container.querySelector('.input-group-sm')).toBeInTheDocument();
  });

  it('should render with debug style when DEBUG_LAYOUT is true', () => {
    // Arrange
    const originalEnv = process.env.DEBUG_LAYOUT;
    process.env.DEBUG_LAYOUT = 'true';

    // Act
    const { container } = render(<GoogleSearchSection />);
    const wrapper = container.firstChild as HTMLElement;

    // Assert
    expect(wrapper).toHaveStyle({
      backgroundColor: '#f3e5f5',
      padding: '8px'
    });

    // Cleanup
    process.env.DEBUG_LAYOUT = originalEnv;
  });

  it('should render without debug style when DEBUG_LAYOUT is not true', () => {
    // Arrange
    const originalEnv = process.env.DEBUG_LAYOUT;
    process.env.DEBUG_LAYOUT = 'false';

    // Act
    const { container } = render(<GoogleSearchSection />);
    const wrapper = container.firstChild as HTMLElement;

    // Assert
    expect(wrapper).not.toHaveStyle({
      backgroundColor: '#f3e5f5',
      padding: '8px'
    });

    // Cleanup
    process.env.DEBUG_LAYOUT = originalEnv;
  });

  it('should render input with correct type', () => {
    // Act
    render(<GoogleSearchSection />);

    // Assert
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should not crash when props are undefined', () => {
    // Act & Assert - Should not throw
    expect(() => render(<GoogleSearchSection />)).not.toThrow();
  });
});
