import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ShareButton } from '@/components/engagement/ShareButton';

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'user-1' } })),
}));

describe('ShareButton', () => {
  it('renders without crashing', () => {
    const { getByLabelText } = renderWithProviders(
      <ShareButton title="Test" body="Test body" />,
    );
    expect(getByLabelText('Share')).toBeTruthy();
  });

  it('pressing calls Share.share (does not throw)', () => {
    const { getByLabelText } = renderWithProviders(
      <ShareButton title="Verse" body="For God so loved the world" url="https://example.com" />,
    );
    fireEvent.press(getByLabelText('Share'));
    // Should not throw
  });
});
