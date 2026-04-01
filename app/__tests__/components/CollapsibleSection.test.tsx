import React from 'react';
import { Text, LayoutAnimation } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { CollapsibleSection } from '@/components/CollapsibleSection';

// Mock LayoutAnimation
jest.spyOn(LayoutAnimation, 'configureNext').mockImplementation(() => {});

describe('CollapsibleSection', () => {
  it('renders the title', () => {
    const { getByText } = render(
      <CollapsibleSection title="Details">
        <Text>Content</Text>
      </CollapsibleSection>,
    );
    expect(getByText('Details')).toBeTruthy();
  });

  it('hides children by default (initiallyCollapsed=true)', () => {
    const { queryByText } = render(
      <CollapsibleSection title="Details">
        <Text>Content</Text>
      </CollapsibleSection>,
    );
    expect(queryByText('Content')).toBeNull();
  });

  it('shows children when initiallyCollapsed=false', () => {
    const { getByText } = render(
      <CollapsibleSection title="Details" initiallyCollapsed={false}>
        <Text>Content</Text>
      </CollapsibleSection>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('toggles visibility on press', () => {
    const { getByText, queryByText } = render(
      <CollapsibleSection title="Details">
        <Text>Content</Text>
      </CollapsibleSection>,
    );
    // Initially collapsed - click to expand
    fireEvent.press(getByText('Details'));
    expect(getByText('Content')).toBeTruthy();

    // Click to collapse again
    fireEvent.press(getByText('Details'));
    expect(queryByText('Content')).toBeNull();
  });
});
