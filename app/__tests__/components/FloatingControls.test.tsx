import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { FloatingControls } from '@/components/map/FloatingControls';
import { renderWithProviders } from '../helpers/renderWithProviders';

beforeEach(() => jest.clearAllMocks());

describe('FloatingControls', () => {
  const defaultProps = {
    showModern: false,
    onToggleNames: jest.fn(),
    onCentre: jest.fn(),
  };

  it('renders the toggle button with "Modern" when showModern is false', () => {
    const { getByText } = renderWithProviders(
      <FloatingControls {...defaultProps} />,
    );
    expect(getByText('Modern')).toBeTruthy();
  });

  it('renders the toggle button with "Biblical" when showModern is true', () => {
    const { getByText } = renderWithProviders(
      <FloatingControls {...defaultProps} showModern={true} />,
    );
    expect(getByText('Biblical')).toBeTruthy();
  });

  it('renders the Centre button', () => {
    const { getByText } = renderWithProviders(
      <FloatingControls {...defaultProps} />,
    );
    expect(getByText('Centre')).toBeTruthy();
  });

  it('calls onToggleNames when the toggle button is pressed', () => {
    const onToggleNames = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <FloatingControls {...defaultProps} onToggleNames={onToggleNames} />,
    );
    fireEvent.press(getByLabelText('Switch to modern view'));
    expect(onToggleNames).toHaveBeenCalledTimes(1);
  });

  it('calls onCentre when the Centre button is pressed', () => {
    const onCentre = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <FloatingControls {...defaultProps} onCentre={onCentre} />,
    );
    fireEvent.press(getByLabelText('Centre map'));
    expect(onCentre).toHaveBeenCalledTimes(1);
  });
});
