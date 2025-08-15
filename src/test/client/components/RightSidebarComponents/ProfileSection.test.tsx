import { render, screen } from '@testing-library/react';
import { ProfileSection } from 'client/components/RightSidebarComponents/ProfileSection/index';

describe('ProfileSection Component', () => {
  it('should render profile section with "Profile Section" text', () => {
    // Act
    render(<ProfileSection />);

    // Assert
    expect(screen.getByText('Profile Section')).toBeInTheDocument();
  });

  it('should have correct Bootstrap column classes', () => {
    // Act
    const { container } = render(<ProfileSection />);
    const wrapper = container.firstChild as HTMLElement;

    // Assert
    expect(wrapper).toHaveClass('col-md-3', 'mb-2');
  });

  it('should render with debug style when DEBUG_LAYOUT is true', () => {
    // Arrange
    const originalEnv = process.env.DEBUG_LAYOUT;
    process.env.DEBUG_LAYOUT = 'true';

    // Act
    const { container } = render(<ProfileSection />);
    const wrapper = container.firstChild as HTMLElement;

    // Assert
    expect(wrapper).toHaveStyle({
      backgroundColor: '#e0f7e0',
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
    const { container } = render(<ProfileSection />);
    const wrapper = container.firstChild as HTMLElement;

    // Assert
    expect(wrapper).not.toHaveStyle({
      backgroundColor: '#e0f7e0',
      padding: '8px'
    });

    // Cleanup
    process.env.DEBUG_LAYOUT = originalEnv;
  });

  it('should render as a div element', () => {
    // Act
    const { container } = render(<ProfileSection />);

    // Assert
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('should not crash when props are undefined', () => {
    // Act & Assert - Should not throw
    expect(() => render(<ProfileSection />)).not.toThrow();
  });
});
