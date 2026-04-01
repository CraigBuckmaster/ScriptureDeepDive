/**
 * ChiasmView.test.tsx — Tests for the chiasm visualization component.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ChiasmView } from '@/components/panels/ChiasmView';
import type { ChiasmData } from '@/types';

const data: ChiasmData = {
  title: 'Chiasm of Genesis 1',
  pairs: [
    { label: 'A', top: 'Light created', bottom: 'Luminaries placed', color: '#64B5F6' },
    { label: 'B', top: 'Waters divided', bottom: 'Sea creatures', color: '#81C784' },
  ],
  center: { label: 'C', text: 'Dry land and vegetation appear' },
};

describe('ChiasmView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<ChiasmView data={data} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the title', () => {
    const { getByText } = renderWithProviders(<ChiasmView data={data} />);
    expect(getByText('Chiasm of Genesis 1')).toBeTruthy();
  });

  it('renders pair labels and center', () => {
    const { getByText } = renderWithProviders(<ChiasmView data={data} />);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
    expect(getByText('Dry land and vegetation appear')).toBeTruthy();
  });

  it('renders top and bottom pair text', () => {
    const { getByText } = renderWithProviders(<ChiasmView data={data} />);
    expect(getByText('Light created')).toBeTruthy();
    expect(getByText('Luminaries placed')).toBeTruthy();
    expect(getByText('Waters divided')).toBeTruthy();
    expect(getByText('Sea creatures')).toBeTruthy();
  });
});
