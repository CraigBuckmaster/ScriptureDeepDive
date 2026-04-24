import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { EvidenceTrailRow, StudyModeSelector } from '@/components/guidedStudy';

const trailItem = {
  key: 'context:genesis_1_1:ctx',
  title: 'Start with context',
  subtitle: 'Ancient audience, genre, and setting',
  panelType: 'ctx',
  sectionNum: 1,
  badge: 'Required' as const,
};

describe('guided study V2 components', () => {
  it('renders study modes and emits selection changes', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<StudyModeSelector value="deep" onChange={onChange} />);

    fireEvent.press(getByLabelText('Teaching prep, 25 min'));

    expect(onChange).toHaveBeenCalledWith('teaching');
  });

  it('renders an evidence trail row with its badge and opens the panel', () => {
    const onPress = jest.fn();
    const { getByLabelText, getByText } = render(
      <EvidenceTrailRow item={trailItem} index={0} onPress={onPress} />,
    );

    expect(getByText('Start with context')).toBeTruthy();
    expect(getByText('Required')).toBeTruthy();
    fireEvent.press(getByLabelText('Open Start with context'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
