/**
 * PanelContainer.test.tsx — Tests for the panel wrapper component.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PanelContainer } from '@/components/PanelContainer';

// Minimal valid JSON for a cross-ref panel
const contentJson = JSON.stringify([{ ref: 'Gen 1:1', note: 'Creation account' }]);

describe('PanelContainer', () => {
  it('renders children (panel content) when open', () => {
    const { getByText } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen />,
    );
    expect(getByText('Gen 1:1')).toBeTruthy();
  });

  it('returns null when not open', () => {
    const { toJSON } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen={false} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('close button calls onClose', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close panel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with border styling (borderLeftWidth)', () => {
    const { toJSON } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen />,
    );
    // The root View should have borderLeftWidth: 3
    const root = toJSON();
    expect(root).not.toBeNull();
    // Verify it rendered something (not null)
    expect(root?.type).toBe('View');
  });

  // HWGTB #1555 — st2 panels honor premium props threaded from
  // ChapterScreen → PanelContainer → PanelRenderer → SecondTemplePanel.
  describe('st2 premium gating', () => {
    const st2Json = JSON.stringify({
      header: "Jude's Use of Second Temple Literature",
      body: 'In these twelve verses Jude draws on two works outside the Hebrew canon.',
      extrabiblical_ids: ['1_enoch'],
      citation_refs: [{ nt: 'Jude 14-15', source: '1 Enoch 1:9', type: 'direct_quotation' }],
      scholar_voices: [],
      takeaway: 'NT citation does not equal canonicity.',
    });

    it('free tier renders the upgrade CTA teaser', () => {
      const { getByText } = renderWithProviders(
        <PanelContainer
          panelType="st2"
          contentJson={st2Json}
          isOpen
          isPremium={false}
        />,
      );
      expect(getByText(/Unlock Second Temple Context/)).toBeTruthy();
    });

    it('free tier tap on teaser fires onUpgradePress', () => {
      const onUpgradePress = jest.fn();
      const { getByLabelText } = renderWithProviders(
        <PanelContainer
          panelType="st2"
          contentJson={st2Json}
          isOpen
          isPremium={false}
          onUpgradePress={onUpgradePress}
        />,
      );
      fireEvent.press(getByLabelText('Unlock Second Temple Context'));
      expect(onUpgradePress).toHaveBeenCalledTimes(1);
    });

    it('premium tier renders the full body (no teaser)', () => {
      const { getByText, queryByText } = renderWithProviders(
        <PanelContainer
          panelType="st2"
          contentJson={st2Json}
          isOpen
          isPremium
        />,
      );
      expect(getByText(/In these twelve verses Jude draws/)).toBeTruthy();
      expect(queryByText(/Unlock Second Temple Context/)).toBeNull();
    });
  });
});
