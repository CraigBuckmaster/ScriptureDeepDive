/**
 * #1835 — visited state on EvidenceTrailRow (gold check + a11y label).
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { EvidenceTrailRow } from '@/components/guidedStudy/EvidenceTrailRow';
import type { GuidedEvidenceTrailItem } from '@/services/guidedStudy';

const ITEM: GuidedEvidenceTrailItem = {
  key: 'trail-hist-2',
  title: 'Historical context',
  subtitle: 'Section 2 · Background',
  panelType: 'hist',
  sectionNum: 2,
  badge: 'Required',
};

describe('EvidenceTrailRow visited state (#1835)', () => {
  it('unvisited: no check, plain label', () => {
    const { getByLabelText, queryByTestId } = render(
      <EvidenceTrailRow item={ITEM} index={0} onPress={jest.fn()} />,
    );
    expect(getByLabelText('Open Historical context')).toBeTruthy();
    expect(queryByTestId('trail-visited-trail-hist-2')).toBeNull();
  });

  it('visited: gold check icon and ", visited" in the a11y label', () => {
    const { getByLabelText, getByTestId } = render(
      <EvidenceTrailRow item={ITEM} index={0} onPress={jest.fn()} visited />,
    );
    expect(getByLabelText('Open Historical context, visited')).toBeTruthy();
    expect(getByTestId('trail-visited-trail-hist-2')).toBeTruthy();
  });
});
