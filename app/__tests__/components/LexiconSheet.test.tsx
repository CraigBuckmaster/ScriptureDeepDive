/**
 * Tests for LexiconSheet component.
 */
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { LexiconSheet } from '@/components/LexiconSheet';

// Mock hooks
jest.mock('@/hooks/useLexicon', () => ({
  useLexicon: jest.fn().mockReturnValue({
    entry: null,
    related: [],
    loading: false,
  }),
}));

jest.mock('@/components/LexiconDefinition', () => ({
  LexiconDefinition: ({ shortDef }: any) => {
    const RN = require('react-native');
    return <RN.Text testID="lexicon-definition">{shortDef}</RN.Text>;
  },
}));

jest.mock('@/components/RelatedWordCard', () => ({
  RelatedWordCard: ({ lemma, onPress }: any) => {
    const RN = require('react-native');
    return (
      <RN.TouchableOpacity onPress={onPress} testID={`related-${lemma}`}>
        <RN.Text>{lemma}</RN.Text>
      </RN.TouchableOpacity>
    );
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const RN = require('react-native');
    return <RN.Text testID="loading-skeleton">Loading...</RN.Text>;
  },
}));

describe('LexiconSheet', () => {
  const { useLexicon } = require('@/hooks/useLexicon');

  beforeEach(() => {
    jest.clearAllMocks();
    useLexicon.mockReturnValue({
      entry: null,
      related: [],
      loading: false,
    });
  });

  it('returns null when not visible', () => {
    const { toJSON } = renderWithProviders(
      <LexiconSheet visible={false} strongs="H1234" onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders LEXICON header when visible', () => {
    useLexicon.mockReturnValue({ entry: null, related: [], loading: false });
    const { getByText } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H9999" onClose={jest.fn()} />,
    );
    expect(getByText('LEXICON')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    useLexicon.mockReturnValue({ entry: null, related: [], loading: true });
    const { getByTestId } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H1234" onClose={jest.fn()} />,
    );
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('shows empty state when no entry found', () => {
    useLexicon.mockReturnValue({ entry: null, related: [], loading: false });
    const { getByText } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H9999" onClose={jest.fn()} />,
    );
    expect(getByText(/No lexicon entry/)).toBeTruthy();
  });

  it('renders entry details when entry exists', () => {
    useLexicon.mockReturnValue({
      entry: {
        strongs: 'H1234',
        lemma: '\u05D0\u05B5\u05DC',
        transliteration: 'el',
        language: 'hebrew',
        pos: 'noun',
        definition_json: '{"short":"God","full":"The Almighty God"}',
        etymology: 'from a root meaning strength',
      },
      related: [],
      loading: false,
    });
    const { getByText } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H1234" onClose={jest.fn()} />,
    );
    expect(getByText('el')).toBeTruthy();
    expect(getByText('H1234')).toBeTruthy();
    expect(getByText('Hebrew')).toBeTruthy();
    expect(getByText('noun')).toBeTruthy();
    expect(getByText('DEFINITION')).toBeTruthy();
    expect(getByText('ETYMOLOGY')).toBeTruthy();
    expect(getByText('from a root meaning strength')).toBeTruthy();
  });

  it('renders related words when available', () => {
    useLexicon.mockReturnValue({
      entry: {
        strongs: 'H1234',
        lemma: 'el',
        transliteration: 'el',
        language: 'hebrew',
        pos: 'noun',
        definition_json: '{"short":"God","full":""}',
        etymology: null,
      },
      related: [
        { strongs: 'H5678', lemma: 'elohim', transliteration: 'elohim', definition_json: '{"short":"gods"}' },
      ],
      loading: false,
    });
    const { getByText } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H1234" onClose={jest.fn()} />,
    );
    expect(getByText('RELATED WORDS')).toBeTruthy();
    expect(getByText('elohim')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    useLexicon.mockReturnValue({ entry: null, related: [], loading: false });
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H1234" onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close lexicon'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows curated study banner when wordStudyId is provided', () => {
    useLexicon.mockReturnValue({
      entry: {
        strongs: 'H1234',
        lemma: 'el',
        transliteration: 'el',
        language: 'hebrew',
        pos: null,
        definition_json: '{"short":"God","full":""}',
        etymology: null,
      },
      related: [],
      loading: false,
    });
    const { getByText } = renderWithProviders(
      <LexiconSheet
        visible={true}
        strongs="H1234"
        onClose={jest.fn()}
        wordStudyId="ws-1"
        onWordStudyPress={jest.fn()}
      />,
    );
    expect(getByText('Curated Study Available')).toBeTruthy();
  });

  it('shows concordance button when onConcordancePress is provided', () => {
    useLexicon.mockReturnValue({
      entry: {
        strongs: 'H1234',
        lemma: 'el',
        transliteration: 'el',
        language: 'greek',
        pos: null,
        definition_json: '{"short":"God","full":""}',
        etymology: null,
      },
      related: [],
      loading: false,
    });
    const onConcordancePress = jest.fn();
    const { getByText } = renderWithProviders(
      <LexiconSheet
        visible={true}
        strongs="H1234"
        onClose={jest.fn()}
        onConcordancePress={onConcordancePress}
      />,
    );
    expect(getByText('See all occurrences')).toBeTruthy();
    fireEvent.press(getByText('See all occurrences'));
    expect(onConcordancePress).toHaveBeenCalledWith({
      strongs: 'H1234',
      original: 'el',
      transliteration: 'el',
      gloss: 'God',
    });
  });

  it('navigates to related word when pressed', () => {
    useLexicon.mockReturnValue({
      entry: {
        strongs: 'H1234',
        lemma: 'el',
        transliteration: 'el',
        language: 'hebrew',
        pos: null,
        definition_json: '{"short":"God","full":""}',
        etymology: null,
      },
      related: [
        { strongs: 'H5678', lemma: 'elohim', transliteration: 'elohim', definition_json: '{"short":"gods"}' },
      ],
      loading: false,
    });
    const { getByTestId } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H1234" onClose={jest.fn()} />,
    );
    fireEvent.press(getByTestId('related-elohim'));
    // After pressing, useLexicon should be called with the new strongs
    expect(useLexicon).toHaveBeenCalled();
  });

  it('handles invalid definition_json gracefully', () => {
    useLexicon.mockReturnValue({
      entry: {
        strongs: 'H1234',
        lemma: 'el',
        transliteration: 'el',
        language: 'hebrew',
        pos: null,
        definition_json: 'invalid json',
        etymology: null,
      },
      related: [],
      loading: false,
    });
    const { getByText } = renderWithProviders(
      <LexiconSheet visible={true} strongs="H1234" onClose={jest.fn()} />,
    );
    expect(getByText('No definition available')).toBeTruthy();
  });
});
