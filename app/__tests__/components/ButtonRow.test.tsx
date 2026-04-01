/**
 * ButtonRow.test.tsx — Tests for the panel button row component.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ButtonRow } from '@/components/ButtonRow';
import type { SectionPanel } from '@/types';

const makePanels = (...types: string[]): SectionPanel[] =>
  types.map((t, i) => ({
    id: i + 1,
    section_id: 'sec-1',
    panel_type: t,
    content_json: '{}',
  }));

describe('ButtonRow', () => {
  it('renders content panel buttons', () => {
    const panels = makePanels('heb', 'cross');
    const { getByText } = renderWithProviders(
      <ButtonRow panels={panels} activePanel={null} onToggle={jest.fn()} />,
    );
    expect(getByText('Hebrew')).toBeTruthy();
    expect(getByText('Connections')).toBeTruthy();
  });

  it('active button has selected accessibility state', () => {
    const panels = makePanels('heb', 'cross');
    const { getByLabelText } = renderWithProviders(
      <ButtonRow panels={panels} activePanel="heb" onToggle={jest.fn()} />,
    );
    const activeBtn = getByLabelText('Hebrew panel, open');
    expect(activeBtn).toBeTruthy();
  });

  it('pressing a button calls onToggle with the panel type', () => {
    const onToggle = jest.fn();
    const panels = makePanels('heb', 'cross');
    const { getByText } = renderWithProviders(
      <ButtonRow panels={panels} activePanel={null} onToggle={onToggle} />,
    );
    fireEvent.press(getByText('Connections'));
    expect(onToggle).toHaveBeenCalledWith('cross');
  });

  it('returns null when panels array is empty', () => {
    const { toJSON } = renderWithProviders(
      <ButtonRow panels={[]} activePanel={null} onToggle={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders scholar panels after a divider', () => {
    const panels = makePanels('heb', 'mac');
    const { getByText } = renderWithProviders(
      <ButtonRow panels={panels} activePanel={null} onToggle={jest.fn()} />,
    );
    expect(getByText('Hebrew')).toBeTruthy();
    expect(getByText('MacArthur')).toBeTruthy();
  });
});
