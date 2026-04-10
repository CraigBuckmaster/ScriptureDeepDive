import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ContentUpdateBanner } from '@/components/ContentUpdateBanner';

describe('ContentUpdateBanner', () => {
  it('renders downloading status text when visible', () => {
    const { getByText } = renderWithProviders(
      <ContentUpdateBanner visible={true} progress={50} status="downloading" />,
    );
    expect(getByText('Downloading study content\u2026')).toBeTruthy();
  });

  it('renders success status text', () => {
    const { getByText } = renderWithProviders(
      <ContentUpdateBanner visible={true} progress={100} status="success" />,
    );
    expect(getByText('Content updated!')).toBeTruthy();
  });
});
