/**
 * SecondTemplePanel.test.tsx — Tests for the Second Temple Context panel
 * (HWGTB-P2-01 / #1546).
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { SecondTemplePanel } from '@/components/panels/SecondTemplePanel';
import type { SecondTemplePanelPayload } from '@/types';

const PAYLOAD: SecondTemplePanelPayload = {
  header: "Jude's Use of Second Temple Literature",
  body: 'In the twelve verses of this section Jude draws on two works outside the Hebrew canon.',
  extrabiblical_ids: ['1_enoch', 'assumption_of_moses'],
  citation_refs: [
    { nt: 'Jude 14-15', source: '1 Enoch 1:9', type: 'direct_quotation' },
    { nt: 'Jude 9', source: 'Assumption of Moses', type: 'allusion' },
  ],
  scholar_voices: [
    {
      scholar_id: 'bruce',
      tradition: 'Evangelical NT',
      note: "Bruce argues Jude's formula affirms the quoted content as true prophecy.",
    },
    {
      scholar_id: 'tertullian',
      tradition: 'Patristic',
      note: 'Tertullian defended 1 Enoch as Scripture on the basis of this citation.',
    },
  ],
  takeaway:
    'NT citation does not equal canonicity, but documents the permeable edge of 1st-century Scripture.',
};

describe('SecondTemplePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders header and body when premium', () => {
    const { getByText } = renderWithProviders(
      <SecondTemplePanel data={PAYLOAD} isPremium />,
    );
    expect(getByText("Jude's Use of Second Temple Literature")).toBeTruthy();
    expect(
      getByText(/In the twelve verses of this section Jude/),
    ).toBeTruthy();
  });

  it('renders citation badges with NT ref + source + type', () => {
    const { getByText } = renderWithProviders(
      <SecondTemplePanel data={PAYLOAD} isPremium />,
    );
    expect(getByText('Jude 14-15')).toBeTruthy();
    expect(getByText('1 Enoch 1:9')).toBeTruthy();
    expect(getByText('Direct quotation')).toBeTruthy();
    expect(getByText('Allusion')).toBeTruthy();
  });

  it('renders extrabiblical chips as formatted labels', () => {
    const onExtraBiblicalPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <SecondTemplePanel
        data={PAYLOAD}
        isPremium
        onExtraBiblicalPress={onExtraBiblicalPress}
      />,
    );
    expect(getByLabelText('Open 1_enoch detail')).toBeTruthy();
    expect(getByLabelText('Open assumption_of_moses detail')).toBeTruthy();
  });

  it('fires onExtraBiblicalPress with the id on chip tap', () => {
    const onExtraBiblicalPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <SecondTemplePanel
        data={PAYLOAD}
        isPremium
        onExtraBiblicalPress={onExtraBiblicalPress}
      />,
    );
    fireEvent.press(getByLabelText('Open 1_enoch detail'));
    expect(onExtraBiblicalPress).toHaveBeenCalledWith('1_enoch');
  });

  it('fires onScholarPress with the scholar_id on scholar tap', () => {
    const onScholarPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <SecondTemplePanel
        data={PAYLOAD}
        isPremium
        onScholarPress={onScholarPress}
      />,
    );
    fireEvent.press(getByLabelText('Scholar: tertullian'));
    expect(onScholarPress).toHaveBeenCalledWith('tertullian');
  });

  it('renders takeaway text in italicized block', () => {
    const { getByText } = renderWithProviders(
      <SecondTemplePanel data={PAYLOAD} isPremium />,
    );
    expect(getByText(/NT citation does not equal canonicity/)).toBeTruthy();
  });

  it('free tier shows upgrade CTA and does not render full body / chips / voices / takeaway', () => {
    const { getByText, queryByText, queryByLabelText } = renderWithProviders(
      <SecondTemplePanel data={PAYLOAD} isPremium={false} />,
    );
    // Header always visible
    expect(getByText("Jude's Use of Second Temple Literature")).toBeTruthy();
    // Upgrade CTA renders with exactly the issue's specified copy concept
    expect(getByText(/Unlock Second Temple Context/)).toBeTruthy();
    // The unlocked-only chrome is NOT present
    expect(queryByText('Direct quotation')).toBeNull();
    expect(queryByLabelText('Open 1_enoch detail')).toBeNull();
    expect(queryByLabelText('Scholar: tertullian')).toBeNull();
    expect(queryByText(/NT citation does not equal canonicity/)).toBeNull();
  });

  it('free tier tap on teaser fires onUpgradePress', () => {
    const onUpgradePress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <SecondTemplePanel
        data={PAYLOAD}
        isPremium={false}
        onUpgradePress={onUpgradePress}
      />,
    );
    fireEvent.press(getByLabelText('Unlock Second Temple Context'));
    expect(onUpgradePress).toHaveBeenCalledTimes(1);
  });

  it('collapses to hide body on header tap', () => {
    const { getByLabelText, queryByText } = renderWithProviders(
      <SecondTemplePanel data={PAYLOAD} isPremium />,
    );
    expect(queryByText(/In the twelve verses of this section Jude/)).toBeTruthy();
    fireEvent.press(getByLabelText('Collapse Second Temple Context'));
    expect(queryByText(/In the twelve verses of this section Jude/)).toBeNull();
  });

  it('does not render extrabiblical chips when no onExtraBiblicalPress is provided', () => {
    const { queryByLabelText } = renderWithProviders(
      <SecondTemplePanel data={PAYLOAD} isPremium />,
    );
    expect(queryByLabelText('Open 1_enoch detail')).toBeNull();
  });
});
