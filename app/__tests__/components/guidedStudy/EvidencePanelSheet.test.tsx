/**
 * #1835 — evidence panel sheet. In-place panel rendering via the real
 * PanelRenderer, close + open-full-chapter actions, missing-content
 * fallback.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { EvidencePanelSheet } from '@/components/guidedStudy/EvidencePanelSheet';

const ITEM = {
  key: 'trail-ctx-1',
  title: 'Literary context',
  subtitle: 'Section 1 · Context',
  panelType: 'ctx',
  sectionNum: 1,
};

describe('EvidencePanelSheet (#1835)', () => {
  it('renders the tapped panel content in place via PanelRenderer', () => {
    const { getByText } = render(
      <EvidencePanelSheet
        visible
        item={ITEM}
        contentJson={JSON.stringify('The storm scene mirrors the creation account in reverse.')}
        onClose={jest.fn()}
        onOpenFullChapter={jest.fn()}
      />,
    );
    expect(getByText('Literary context')).toBeTruthy();
    expect(getByText('Section 1 · Context')).toBeTruthy();
    // 'ctx' panels render their string payload through ContextPanel.
    expect(
      getByText('The storm scene mirrors the creation account in reverse.', { exact: false }),
    ).toBeTruthy();
  });

  it('close and open-full-chapter controls are accessible buttons', () => {
    const onClose = jest.fn();
    const onOpenFullChapter = jest.fn();
    const { getByLabelText } = render(
      <EvidencePanelSheet
        visible
        item={ITEM}
        contentJson={JSON.stringify('text')}
        onClose={onClose}
        onOpenFullChapter={onOpenFullChapter}
      />,
    );

    fireEvent.press(getByLabelText('Close panel'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(getByLabelText('Open full chapter'));
    expect(onOpenFullChapter).toHaveBeenCalledTimes(1);
  });

  it('falls back gracefully when the panel content cannot be located', () => {
    const { getByText } = render(
      <EvidencePanelSheet
        visible
        item={ITEM}
        contentJson={null}
        onClose={jest.fn()}
        onOpenFullChapter={jest.fn()}
      />,
    );
    expect(getByText('This panel lives in the full chapter view.')).toBeTruthy();
    expect(getByText('Open full chapter')).toBeTruthy();
  });
});
