import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { RoleBadge, getRoleBadgeConfig } from '@/components/tree/RoleBadge';

describe('RoleBadge', () => {
  it('renders a K for kings', () => {
    const { getByText } = renderWithProviders(<RoleBadge role="king" />);
    expect(getByText('K')).toBeTruthy();
  });

  it('renders a P for patriarchs', () => {
    const { getByText } = renderWithProviders(<RoleBadge role="patriarch" />);
    expect(getByText('P')).toBeTruthy();
  });

  it('renders a J for judges', () => {
    const { getByText } = renderWithProviders(<RoleBadge role="judge" />);
    expect(getByText('J')).toBeTruthy();
  });

  it('renders a T for tribes', () => {
    const { getByText } = renderWithProviders(<RoleBadge role="tribe" />);
    expect(getByText('T')).toBeTruthy();
  });

  it('renders glyphs for priest and prophet', () => {
    const priest = renderWithProviders(<RoleBadge role="priest" />);
    expect(priest.getByText('⛊')).toBeTruthy();
    const prophet = renderWithProviders(<RoleBadge role="prophet" />);
    expect(prophet.getByText('✧')).toBeTruthy();
  });

  it('renders nothing for unknown/null roles', () => {
    const unknown = renderWithProviders(<RoleBadge role="civilian" />);
    expect(unknown.toJSON()).toBeNull();
    const empty = renderWithProviders(<RoleBadge role={null} />);
    expect(empty.toJSON()).toBeNull();
  });

  it('exposes an accessibility label with the role name', () => {
    const { getByLabelText } = renderWithProviders(<RoleBadge role="king" />);
    expect(getByLabelText(/king role badge/i)).toBeTruthy();
  });
});

describe('getRoleBadgeConfig', () => {
  it('returns null for unknown roles', () => {
    expect(getRoleBadgeConfig('farmer', { gold: '#fff' })).toBeNull();
    expect(getRoleBadgeConfig(null, { gold: '#fff' })).toBeNull();
    expect(getRoleBadgeConfig(undefined, { gold: '#fff' })).toBeNull();
  });

  it('prefers the era color for patriarch / judge / tribe when provided', () => {
    const cfg = getRoleBadgeConfig('patriarch', { gold: '#fff', eraColor: '#abc' });
    expect(cfg?.color).toBe('#abc');
  });

  it('falls back to gold when no era color is provided', () => {
    const cfg = getRoleBadgeConfig('patriarch', { gold: '#fff' });
    expect(cfg?.color).toBe('#fff');
  });

  it('kings always use the gold color', () => {
    expect(getRoleBadgeConfig('king', { gold: '#fff', eraColor: '#abc' })?.color).toBe('#fff');
  });
});
