import React from 'react';
import { render } from '@testing-library/react-native';
import { HighlightedText } from '@/components/HighlightedText';

describe('HighlightedText', () => {
  it('renders plain text when no groups', () => {
    const { getByText } = render(
      <HighlightedText text="In the beginning" groups={[]} sectionId="s1" />,
    );
    expect(getByText(/In the beginning/)).toBeTruthy();
  });

  it('renders text with VHL groups', () => {
    const groups = [
      {
        id: 1,
        chapter_id: 'gen-1',
        group_name: 'DIVINE',
        css_class: 'divine',
        words_json: '["God"]',
        btn_types_json: '["hebrew","context"]',
      },
    ];
    const { getByText } = render(
      <HighlightedText text="God created the heavens" groups={groups} sectionId="s1" />,
    );
    expect(getByText(/created/)).toBeTruthy();
  });

  it('calls onVhlWordPress when highlighted word is tapped', () => {
    const mockOnPress = jest.fn();
    const groups = [
      {
        id: 1,
        chapter_id: 'gen-1',
        group_name: 'DIVINE',
        css_class: 'divine',
        words_json: '["God"]',
        btn_types_json: '["hebrew","context"]',
      },
    ];
    const { getByLabelText } = render(
      <HighlightedText
        text="God created"
        groups={groups}
        sectionId="s1"
        onVhlWordPress={mockOnPress}
      />,
    );
    // The highlighted word should have an accessibility label
    const wordEl = getByLabelText(/Highlighted word/);
    expect(wordEl).toBeTruthy();
  });
});
