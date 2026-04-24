import React from 'react';
import { render } from '@testing-library/react-native';
import { StudySessionCTA } from '@/components/guidedStudy';

describe('guided study V3 CTA states', () => {
  const estimate = { readMin: 4, guidedMin: 12, deepMin: 25 };

  it('renders continue state copy', () => {
    const { getByText } = render(
      <StudySessionCTA
        estimate={estimate}
        mode="continue"
        currentStep="observe"
        onPress={jest.fn()}
      />,
    );

    expect(getByText('Continue study')).toBeTruthy();
    expect(getByText('Resume at Observe · 12 min guided')).toBeTruthy();
  });

  it('renders review state copy', () => {
    const { getByText } = render(
      <StudySessionCTA estimate={estimate} mode="review" dueCount={2} onPress={jest.fn()} />,
    );

    expect(getByText('Review insights')).toBeTruthy();
    expect(getByText('2 review prompts due for this chapter')).toBeTruthy();
  });
});
