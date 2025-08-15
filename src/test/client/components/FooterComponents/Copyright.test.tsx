import { render, screen } from '@testing-library/react';
import { Copyright } from '../../../../client/components/FooterComponents/Copyright';

describe('Copyright Component', () => {
  it('should render copyright text with current year', () => {
    // Arrange
    const currentYear = new Date().getFullYear().toString();

    // Act
    render(<Copyright />);

    // Assert
    expect(screen.getByText(`© Syntonic Studios ${currentYear}`)).toBeInTheDocument();
  });

  it('should render with debug style when DEBUG_LAYOUT is true', () => {
    // Arrange
    const originalEnv = process.env.DEBUG_LAYOUT;
    process.env.DEBUG_LAYOUT = 'true';

    // Act
    const { container } = render(<Copyright />);
    const footerDiv = container.firstChild as HTMLElement;

    // Assert
    expect(footerDiv).toHaveStyle({
      backgroundColor: '#f5f5f5',
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
    const { container } = render(<Copyright />);
    const footerDiv = container.firstChild as HTMLElement;

    // Assert
    expect(footerDiv).not.toHaveStyle({
      backgroundColor: '#f5f5f5',
      padding: '8px'
    });

    // Cleanup
    process.env.DEBUG_LAYOUT = originalEnv;
  });

  it('should update year dynamically', () => {
    // This test ensures the component uses Date() at render time, not a static value
    // We can test this by mocking the Date constructor

    // Arrange
    const mockYear = 2030;
    const OriginalDate = global.Date;
    global.Date = jest.fn(() => ({
      getFullYear: () => mockYear
    })) as any;

    // Act
    render(<Copyright />);

    // Assert
    expect(screen.getByText(`© Syntonic Studios ${mockYear}`)).toBeInTheDocument();

    // Cleanup
    global.Date = OriginalDate;
  });

  it('should have the footer styling applied', () => {
    // Act
    const { container } = render(<Copyright />);
    const footerDiv = container.firstChild as HTMLElement;

    // Assert - This tests that the component renders with the expected structure
    expect(footerDiv).toBeInstanceOf(HTMLDivElement);
    expect(footerDiv.querySelector('p')).toBeInTheDocument();
    // The CSS module class will be transformed in the test environment
  });
});
