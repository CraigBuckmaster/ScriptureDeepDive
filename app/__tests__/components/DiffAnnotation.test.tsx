import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DiffAnnotation, DiffAnnotationList, type DiffAnnotationData } from '@/components/DiffAnnotation';

const makeAnnotation = (overrides?: Partial<DiffAnnotationData>): DiffAnnotationData => ({
  location: 'Matt 5:3 / Luke 6:20',
  diff_type: 'wording',
  matthew: 'Blessed are the poor in spirit',
  luke: 'Blessed are you who are poor',
  explanation: 'Matthew spiritualizes the poverty; Luke keeps it literal.',
  ...overrides,
});

describe('DiffAnnotation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <DiffAnnotation annotation={makeAnnotation()} />,
    );
    expect(getByText('Wording')).toBeTruthy();
  });

  it('shows the diff type badge and location', () => {
    const { getByText } = renderWithProviders(
      <DiffAnnotation annotation={makeAnnotation({ diff_type: 'addition' })} />,
    );
    expect(getByText('Addition')).toBeTruthy();
    expect(getByText('Matt 5:3 / Luke 6:20')).toBeTruthy();
  });

  it('shows collapsed preview by default', () => {
    const { getByText } = renderWithProviders(
      <DiffAnnotation annotation={makeAnnotation()} />,
    );
    expect(getByText('▼')).toBeTruthy();
  });

  it('expands to show comparison texts when pressed', () => {
    const { getByText } = renderWithProviders(
      <DiffAnnotation annotation={makeAnnotation()} />,
    );
    fireEvent.press(getByText('Wording'));
    expect(getByText('Blessed are the poor in spirit')).toBeTruthy();
    expect(getByText('Blessed are you who are poor')).toBeTruthy();
    expect(getByText('▲')).toBeTruthy();
  });
});

describe('DiffAnnotationList', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when annotations is empty', () => {
    const { toJSON } = renderWithProviders(
      <DiffAnnotationList annotations={[]} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders list header and all annotations', () => {
    const annotations = [makeAnnotation(), makeAnnotation({ diff_type: 'omission' })];
    const { getByText } = renderWithProviders(
      <DiffAnnotationList annotations={annotations} />,
    );
    expect(getByText('Textual Differences')).toBeTruthy();
    expect(getByText('Omission')).toBeTruthy();
  });
});
