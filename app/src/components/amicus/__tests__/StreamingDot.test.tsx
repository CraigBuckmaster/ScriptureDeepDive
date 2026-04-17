import React from 'react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import StreamingDot from '@/components/amicus/StreamingDot';

describe('StreamingDot', () => {
  it('renders with the responding accessibility label', () => {
    const { getByLabelText } = renderWithProviders(<StreamingDot />);
    expect(getByLabelText('Amicus is responding')).toBeTruthy();
  });
});
