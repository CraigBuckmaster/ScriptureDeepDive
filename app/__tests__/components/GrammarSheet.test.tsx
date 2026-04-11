/**
 * Tests for GrammarSheet component.
 */
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { GrammarSheet } from '@/components/GrammarSheet';

jest.mock('@/hooks/useGrammar', () => ({
  useMorphologyDecode: jest.fn().mockReturnValue(null),
  useGrammarArticle: jest.fn().mockReturnValue({ article: null, loading: false }),
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const RN = require('react-native');
    return <RN.Text testID="loading-skeleton">Loading...</RN.Text>;
  },
}));

describe('GrammarSheet', () => {
  const { useMorphologyDecode, useGrammarArticle } = require('@/hooks/useGrammar');

  beforeEach(() => {
    jest.clearAllMocks();
    useMorphologyDecode.mockReturnValue(null);
    useGrammarArticle.mockReturnValue({ article: null, loading: false });
  });

  it('returns null when not visible', () => {
    const { toJSON } = renderWithProviders(
      <GrammarSheet visible={false} morphologyCode="V-PAI-3S" onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null when morphologyCode is null', () => {
    const { toJSON } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode={null} onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows GRAMMAR header and morphology code', () => {
    useMorphologyDecode.mockReturnValue(null);
    const { getByText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="V-PAI-3S" onClose={jest.fn()} />,
    );
    expect(getByText('GRAMMAR')).toBeTruthy();
    expect(getByText('V-PAI-3S')).toBeTruthy();
  });

  it('shows decoded summary and parts when available', () => {
    useMorphologyDecode.mockReturnValue({
      language: 'greek',
      summary: 'Verb - Present Active Indicative - 3rd Person Singular',
      articleId: null,
      parts: [
        { label: 'Type', value: 'Verb' },
        { label: 'Tense', value: 'Present' },
        { label: 'Voice', value: 'Active' },
      ],
    });
    const { getByText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="V-PAI-3S" onClose={jest.fn()} />,
    );
    expect(getByText('Verb - Present Active Indicative - 3rd Person Singular')).toBeTruthy();
    expect(getByText('MORPHOLOGY BREAKDOWN')).toBeTruthy();
    expect(getByText('Verb')).toBeTruthy();
    expect(getByText('Present')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Greek')).toBeTruthy();
  });

  it('shows Hebrew badge for Hebrew morphology', () => {
    useMorphologyDecode.mockReturnValue({
      language: 'hebrew',
      summary: 'Noun - Masculine Singular',
      articleId: null,
      parts: [{ label: 'Type', value: 'Noun' }],
    });
    const { getByText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="HNcmsa" onClose={jest.fn()} />,
    );
    expect(getByText('Hebrew')).toBeTruthy();
  });

  it('shows empty decode message when no parts', () => {
    useMorphologyDecode.mockReturnValue(null);
    const { getByText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="UNKNOWN" onClose={jest.fn()} />,
    );
    expect(getByText('Unable to decode morphology code.')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="V-PAI-3S" onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close grammar view'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows grammar article when available', () => {
    useMorphologyDecode.mockReturnValue({
      language: 'greek',
      summary: 'Verb - Present Active Indicative',
      articleId: 'art-1',
      parts: [{ label: 'Type', value: 'Verb' }],
    });
    useGrammarArticle.mockReturnValue({
      article: { id: 'art-1', title: 'Present Active Indicative', summary: 'Used for ongoing action' },
      loading: false,
    });
    const { getByText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="V-PAI-3S" onClose={jest.fn()} onArticlePress={jest.fn()} />,
    );
    expect(getByText('GRAMMAR ARTICLE')).toBeTruthy();
    expect(getByText('Present Active Indicative')).toBeTruthy();
    expect(getByText('Read Full Article')).toBeTruthy();
  });

  it('calls onArticlePress when Read Full Article is pressed', () => {
    useMorphologyDecode.mockReturnValue({
      language: 'greek',
      summary: 'Verb',
      articleId: 'art-1',
      parts: [{ label: 'Type', value: 'Verb' }],
    });
    useGrammarArticle.mockReturnValue({
      article: { id: 'art-1', title: 'Test', summary: 'Summary' },
      loading: false,
    });
    const onArticlePress = jest.fn();
    const { getByText } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="V-PAI-3S" onClose={jest.fn()} onArticlePress={onArticlePress} />,
    );
    fireEvent.press(getByText('Read Full Article'));
    expect(onArticlePress).toHaveBeenCalledWith('art-1');
  });

  it('shows loading skeleton while article is loading', () => {
    useMorphologyDecode.mockReturnValue({
      language: 'greek',
      summary: 'Verb',
      articleId: 'art-1',
      parts: [{ label: 'Type', value: 'Verb' }],
    });
    useGrammarArticle.mockReturnValue({ article: null, loading: true });
    const { getByTestId } = renderWithProviders(
      <GrammarSheet visible={true} morphologyCode="V-PAI-3S" onClose={jest.fn()} />,
    );
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });
});
