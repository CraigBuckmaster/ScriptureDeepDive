import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ConceptBrowseScreen from '@/screens/ConceptBrowseScreen';

// ── Navigation mock ───────────────────────────────────────────────
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock hook ────────────────────────────────────────────────────
const mockUseConcepts = jest.fn();
jest.mock('@/hooks/useConceptData', () => ({
  useConcepts: (...args: unknown[]) => mockUseConcepts(...args),
}));

const sampleConcepts = [
  { id: 'c1', title: 'Justification', description: 'The act of being declared righteous before God.', tags: ['salvation', 'pauline'] },
  { id: 'c2', title: 'Covenant', description: 'A binding agreement between God and humanity.', tags: ['ot', 'promise'] },
  { id: 'c3', title: 'Atonement', description: 'Reconciliation with God through sacrifice.', tags: ['sacrifice', 'blood'] },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConcepts.mockReturnValue({
    concepts: sampleConcepts,
    loading: false,
  });
});

// ── Tests ─────────────────────────────────────────────────────────
describe('ConceptBrowseScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<ConceptBrowseScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Concepts header', () => {
    const { getByText } = renderWithProviders(<ConceptBrowseScreen />);
    expect(getByText('Concepts')).toBeTruthy();
  });

  it('renders concept titles', () => {
    const { getByText } = renderWithProviders(<ConceptBrowseScreen />);
    expect(getByText('Justification')).toBeTruthy();
    expect(getByText('Covenant')).toBeTruthy();
    expect(getByText('Atonement')).toBeTruthy();
  });

  it('renders concept descriptions', () => {
    const { getByText } = renderWithProviders(<ConceptBrowseScreen />);
    expect(getByText(/declared righteous/)).toBeTruthy();
  });

  it('renders tags on concept cards', () => {
    const { getByText } = renderWithProviders(<ConceptBrowseScreen />);
    expect(getByText('salvation')).toBeTruthy();
    expect(getByText('pauline')).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    mockUseConcepts.mockReturnValue({ concepts: [], loading: true });
    const { queryByText } = renderWithProviders(<ConceptBrowseScreen />);
    expect(queryByText('Justification')).toBeNull();
  });

  it('shows empty state when no concepts match', () => {
    mockUseConcepts.mockReturnValue({ concepts: [], loading: false });
    const { getByText } = renderWithProviders(<ConceptBrowseScreen />);
    expect(getByText('No concepts found')).toBeTruthy();
  });

  it('navigates to ConceptDetail on card tap', () => {
    const { getByText } = renderWithProviders(<ConceptBrowseScreen />);
    fireEvent.press(getByText('Justification'));
    expect(mockNavigate).toHaveBeenCalledWith('ConceptDetail', { conceptId: 'c1' });
  });
});
