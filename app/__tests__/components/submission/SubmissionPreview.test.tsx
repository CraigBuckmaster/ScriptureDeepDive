import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import SubmissionPreview from '@/components/submission/SubmissionPreview';

describe('SubmissionPreview', () => {
  it('renders title and body', () => {
    const { getByText } = renderWithProviders(
      <SubmissionPreview
        type="personal_reflection"
        title="My Reflection"
        body="Some insightful body text"
        verses={[]}
      />,
    );
    expect(getByText('My Reflection')).toBeTruthy();
    expect(getByText('Some insightful body text')).toBeTruthy();
  });

  it('shows verse count when verses are provided', () => {
    const { getByText } = renderWithProviders(
      <SubmissionPreview
        type="verse_collection"
        title="Verse Set"
        body="Body"
        verses={['John 3:16', 'Romans 8:28', 'Psalm 23:1']}
      />,
    );
    expect(getByText('3 verses selected')).toBeTruthy();
  });
});
