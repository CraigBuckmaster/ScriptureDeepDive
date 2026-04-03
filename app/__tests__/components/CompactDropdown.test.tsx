import React from 'react';
import { View } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { CompactDropdown, type DropdownOption } from '@/components/CompactDropdown';

jest.mock('@/utils/haptics', () => ({
  lightImpact: jest.fn(),
  mediumImpact: jest.fn(),
  selectionFeedback: jest.fn(),
}));

// Patch measureInWindow so handleOpen fires the callback in test env
beforeAll(() => {
  jest.spyOn(View.prototype, 'measureInWindow' as any).mockImplementation(
    function (this: any, ...args: any[]) { const cb = args[0]; cb(0, 0, 100, 40); },
  );
});

const OPTIONS: DropdownOption[] = [
  { key: 'kjv', label: 'KJV' },
  { key: 'esv', label: 'ESV' },
  { key: 'niv', label: 'NIV' },
];

describe('CompactDropdown', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders pill with the active option label', () => {
    const { getByText } = renderWithProviders(
      <CompactDropdown value="esv" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    expect(getByText('ESV')).toBeTruthy();
  });

  it('shows uppercased value when no matching option', () => {
    const { getByText } = renderWithProviders(
      <CompactDropdown value="unknown" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    expect(getByText('UNKNOWN')).toBeTruthy();
  });

  it('has accessible button role with label', () => {
    const { getByLabelText } = renderWithProviders(
      <CompactDropdown value="kjv" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    expect(getByLabelText('KJV, tap to change')).toBeTruthy();
  });

  it('opens modal on press and shows all options', () => {
    const { getAllByText, getByLabelText } = renderWithProviders(
      <CompactDropdown value="kjv" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByLabelText('KJV, tap to change'));
    expect(getAllByText('KJV').length).toBeGreaterThanOrEqual(2); // pill + menu
    expect(getAllByText('ESV')).toHaveLength(1);
    expect(getAllByText('NIV')).toHaveLength(1);
  });

  it('selects an option and calls onSelect', () => {
    const { getAllByText, getByLabelText } = renderWithProviders(
      <CompactDropdown value="kjv" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByLabelText('KJV, tap to change'));
    const nivElements = getAllByText('NIV');
    fireEvent.press(nivElements[nivElements.length - 1]);
    expect(mockOnSelect).toHaveBeenCalledWith('niv');
  });

  it('renders checkmark icon for active option', () => {
    const { getByLabelText, getByTestId } = renderWithProviders(
      <CompactDropdown value="esv" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByLabelText('ESV, tap to change'));
    expect(getByTestId('icon-Check')).toBeTruthy();
  });

  it('non-active options do not have checkmark', () => {
    const { getByLabelText, getAllByTestId } = renderWithProviders(
      <CompactDropdown value="esv" options={OPTIONS} onSelect={mockOnSelect} />,
    );
    fireEvent.press(getByLabelText('ESV, tap to change'));
    // Only 1 checkmark for the active option
    expect(getAllByTestId('icon-Check')).toHaveLength(1);
  });

  it('supports up direction prop without crashing', () => {
    const { getByText } = renderWithProviders(
      <CompactDropdown value="kjv" options={OPTIONS} onSelect={mockOnSelect} direction="up" />,
    );
    expect(getByText('KJV')).toBeTruthy();
  });
});
