import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScreenHeader } from '@/components/ScreenHeader';

describe('ScreenHeader', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the title', () => {
    const { getByText } = render(<ScreenHeader title="Settings" onBack={mockOnBack} />);
    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <ScreenHeader title="Genesis" subtitle="50 chapters" onBack={mockOnBack} />,
    );
    expect(getByText('50 chapters')).toBeTruthy();
  });

  it('does not render subtitle when omitted', () => {
    const { queryByText } = render(<ScreenHeader title="Genesis" onBack={mockOnBack} />);
    expect(queryByText('50 chapters')).toBeNull();
  });

  it('calls onBack when back button is pressed', () => {
    const { getByLabelText } = render(<ScreenHeader title="Test" onBack={mockOnBack} />);
    fireEvent.press(getByLabelText('Go back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('uses custom back label', () => {
    const { getByLabelText } = render(
      <ScreenHeader title="Test" onBack={mockOnBack} backLabel="Return" />,
    );
    expect(getByLabelText('Return')).toBeTruthy();
  });
});
