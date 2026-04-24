import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { PanelRecommendationRow } from '@/components/guidedStudy/PanelRecommendationRow';

describe('PanelRecommendationRow', () => {
  const baseRec = {
    key: 'ctx-1',
    title: 'Historical Context',
    subtitle: 'Ancient Near Eastern background',
    panelType: 'ctx',
  };

  it('renders title and subtitle', () => {
    const { getByText } = renderWithProviders(
      <PanelRecommendationRow recommendation={baseRec as any} onPress={jest.fn()} />,
    );
    expect(getByText('Historical Context')).toBeTruthy();
    expect(getByText('Ancient Near Eastern background')).toBeTruthy();
  });

  it('renders a confidence badge when a level is provided', () => {
    const { getByText } = renderWithProviders(
      <PanelRecommendationRow
        recommendation={{ ...baseRec, confidence: 'debated' } as any}
        onPress={jest.fn()}
      />,
    );
    expect(getByText('Debated')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PanelRecommendationRow recommendation={baseRec as any} onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Open Historical Context'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
