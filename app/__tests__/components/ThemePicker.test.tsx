import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ThemePicker } from '@/components/ThemePicker';

describe('ThemePicker', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders all 3 theme options (Dark, Sepia, Light)', () => {
    const { getByText } = renderWithProviders(
      <ThemePicker theme="dark" setTheme={mockSetTheme} />,
    );
    expect(getByText('Dark')).toBeTruthy();
    expect(getByText('Sepia')).toBeTruthy();
    expect(getByText('Light')).toBeTruthy();
  });

  it('active theme card has selected accessibility state', () => {
    const { getByLabelText } = renderWithProviders(
      <ThemePicker theme="sepia" setTheme={mockSetTheme} />,
    );
    const sepiaButton = getByLabelText('Sepia theme');
    expect(sepiaButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('non-active theme card is not selected', () => {
    const { getByLabelText } = renderWithProviders(
      <ThemePicker theme="dark" setTheme={mockSetTheme} />,
    );
    const lightButton = getByLabelText('Light theme');
    expect(lightButton.props.accessibilityState).toEqual({ selected: false });
  });

  it('pressing a theme card calls setTheme with the mode', () => {
    const { getByLabelText } = renderWithProviders(
      <ThemePicker theme="dark" setTheme={mockSetTheme} />,
    );
    fireEvent.press(getByLabelText('Light theme'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('renders system toggle and pressing it calls setTheme with "system"', () => {
    const { getByLabelText } = renderWithProviders(
      <ThemePicker theme="dark" setTheme={mockSetTheme} />,
    );
    fireEvent.press(getByLabelText('Use system appearance'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
