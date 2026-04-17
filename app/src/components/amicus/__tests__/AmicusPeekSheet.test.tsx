import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import AmicusPeekSheet from '@/components/amicus/AmicusPeekSheet';
import { getMockDb, resetMockDb } from '../../../../__tests__/helpers/mockDb';

jest.mock('@/db/database', () =>
  require('../../../../__tests__/helpers/mockDb').mockDatabaseModule(),
);

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigationState: () => ({ routes: [{ name: 'HomeMain' }], index: 0 }),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const BottomSheet = ({ children }: { children: React.ReactNode }) => (
    <View accessibilityLabel="bottom-sheet">{children}</View>
  );
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetView: View,
    BottomSheetBackdrop: View,
  };
});

beforeEach(() => resetMockDb());

describe('AmicusPeekSheet', () => {
  it('renders chips from the precached_prompts table', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'Why does Paul use this metaphor',
          seed_query: 'Explain the metaphor.',
          expected_source_types: ['chapter_panel'],
        },
      ]),
    });
    const { findByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'chapter', bookId: 'romans', chapterNum: 9 }}
      />,
    );
    expect(
      await findByLabelText('Ask: Why does Paul use this metaphor'),
    ).toBeTruthy();
  });

  it('fires onChipTap with the seed_query when a chip is pressed', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chips_json: JSON.stringify([
        {
          label: 'What does chesed mean in the Psalms',
          seed_query: 'Explain hesed in the Psalms.',
          expected_source_types: ['word_study'],
        },
      ]),
    });
    const onChipTap = jest.fn();
    const { findByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'chapter', bookId: 'psalms', chapterNum: 23 }}
        onChipTap={onChipTap}
      />,
    );
    fireEvent.press(
      await findByLabelText('Ask: What does chesed mean in the Psalms'),
    );
    expect(onChipTap).toHaveBeenCalledWith('Explain hesed in the Psalms.');
  });

  it('calls onSend with trimmed free text', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const onSend = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AmicusPeekSheet
        isOpen
        onClose={() => undefined}
        contextOverride={{ kind: 'none' }}
        onSend={onSend}
      />,
    );
    fireEvent.changeText(getByLabelText('Message Amicus from peek'), '  what is grace?  ');
    fireEvent.press(getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledWith('what is grace?');
  });

  it('returns nothing when isOpen is false', () => {
    const { toJSON } = renderWithProviders(
      <AmicusPeekSheet
        isOpen={false}
        onClose={() => undefined}
        contextOverride={{ kind: 'none' }}
      />,
    );
    expect(toJSON()).toBeNull();
  });
});
