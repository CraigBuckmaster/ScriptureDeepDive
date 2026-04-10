import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import TopicProposal from '@/components/submission/TopicProposal';

describe('TopicProposal', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders heading and form fields', () => {
    const { getByText } = renderWithProviders(
      <TopicProposal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );
    expect(getByText('Propose a New Topic')).toBeTruthy();
    expect(getByText('Topic Title')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
  });

  it('renders category chips', () => {
    const { getByText } = renderWithProviders(
      <TopicProposal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );
    expect(getByText('Faith & Doctrine')).toBeTruthy();
    expect(getByText('Relationships')).toBeTruthy();
    expect(getByText('Life Challenges')).toBeTruthy();
  });
});
