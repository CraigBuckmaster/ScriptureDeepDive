import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import AmicusFab from '@/components/amicus/AmicusFab';
import { AmicusFabProvider, useAmicusFab } from '@/contexts/AmicusFabContext';

const mockNavigate = jest.fn();
const mockGetParent = jest.fn(() => ({ navigate: mockNavigate }));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      getParent: mockGetParent,
    }),
    useNavigationState: () => ({ routes: [{ name: 'HomeMain' }], index: 0 }),
  };
});

// BottomSheet pulls in reanimated; stub it to a simple View in tests.
jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const BottomSheet = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  const BottomSheetView = View;
  const BottomSheetBackdrop = View;
  return { __esModule: true, default: BottomSheet, BottomSheetView, BottomSheetBackdrop };
});

const mockUseAmicusAccess = jest.fn();
jest.mock('@/hooks/useAmicusAccess', () => ({
  useAmicusAccess: () => mockUseAmicusAccess(),
}));

function renderWithFab(node: React.ReactElement) {
  return renderWithProviders(<AmicusFabProvider>{node}</AmicusFabProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAmicusAccess.mockReturnValue({
    canUse: true,
    reason: 'ok',
    entitlement: 'premium',
    usage: { thisMonth: 0, cap: 300, remaining: 300 },
  });
});

describe('AmicusFab', () => {
  it('renders when visible + not suppressed', () => {
    const { getByLabelText } = renderWithFab(<AmicusFab />);
    expect(getByLabelText('Open Amicus')).toBeTruthy();
  });

  it('hides when settings disabled', () => {
    mockUseAmicusAccess.mockReturnValueOnce({
      canUse: false,
      reason: 'disabled_in_settings',
      entitlement: 'premium',
      usage: { thisMonth: 0, cap: 300, remaining: 300 },
    });
    const { queryByLabelText } = renderWithFab(<AmicusFab />);
    expect(queryByLabelText('Open Amicus')).toBeNull();
    expect(queryByLabelText('Unlock Amicus')).toBeNull();
  });

  it('shows lock icon for non-premium and opens paywall on tap', () => {
    mockUseAmicusAccess.mockReturnValueOnce({
      canUse: false,
      reason: 'not_premium',
      entitlement: 'none',
      usage: { thisMonth: 0, cap: 0, remaining: 0 },
    });
    const { getByLabelText } = renderWithFab(<AmicusFab />);
    const fab = getByLabelText('Unlock Amicus');
    fireEvent.press(fab);
    expect(mockGetParent).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      'AmicusTab',
      expect.objectContaining({ screen: 'Paywall' }),
    );
  });

  it('is hidden when a screen requests suppression', () => {
    function Consumer() {
      const { hide } = useAmicusFab();
      React.useEffect(() => hide(), [hide]);
      return null;
    }
    const { queryByLabelText } = render(
      <AmicusFabProvider>
        <Consumer />
        <AmicusFab />
      </AmicusFabProvider>,
    );
    expect(queryByLabelText('Open Amicus')).toBeNull();
  });
});
