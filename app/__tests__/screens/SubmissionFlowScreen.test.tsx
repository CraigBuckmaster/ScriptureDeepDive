import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SubmissionFlowScreen from '@/screens/SubmissionFlowScreen';

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title, onBack }: { title: string; onBack?: () => void }) => {
    const RN = require('react-native');
    return (
      <RN.View>
        <RN.Text>{title}</RN.Text>
        {onBack && <RN.TouchableOpacity testID="header-back" onPress={onBack}><RN.Text>Back</RN.Text></RN.TouchableOpacity>}
      </RN.View>
    );
  },
}));

jest.mock('@/components/submission', () => ({
  TypeSelector: ({ selected, onSelect }: any) => {
    const RN = require('react-native');
    return (
      <RN.TouchableOpacity testID="type-selector" onPress={() => onSelect('insight')}>
        <RN.Text>TypeSelector: {selected ?? 'none'}</RN.Text>
      </RN.TouchableOpacity>
    );
  },
  SubmissionPreview: ({ title, body }: any) => {
    const RN = require('react-native');
    return <RN.Text testID="preview">Preview: {title}</RN.Text>;
  },
  TopicProposal: ({ onSubmit, onCancel }: any) => {
    const RN = require('react-native');
    return (
      <RN.View testID="topic-proposal">
        <RN.TouchableOpacity testID="proposal-submit" onPress={() => onSubmit({ title: 'New Topic', category: 'test', reason: 'test' })}>
          <RN.Text>Submit Proposal</RN.Text>
        </RN.TouchableOpacity>
        <RN.TouchableOpacity testID="proposal-cancel" onPress={onCancel}>
          <RN.Text>Cancel Proposal</RN.Text>
        </RN.TouchableOpacity>
      </RN.View>
    );
  },
}));

const mockScreenSubmission = jest.fn().mockResolvedValue({ decision: 'approve' });
jest.mock('@/services/contentModeration', () => ({
  screenSubmission: (...args: any[]) => mockScreenSubmission(...args),
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
}));

describe('SubmissionFlowScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenSubmission.mockResolvedValue({ decision: 'approve' });
  });

  it('renders the screen header with step title', () => {
    const { getByText } = renderWithProviders(<SubmissionFlowScreen />);
    expect(getByText('Select Type')).toBeTruthy();
  });

  it('renders step indicator', () => {
    const { getByText } = renderWithProviders(<SubmissionFlowScreen />);
    expect(getByText('Step 1 of 5')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<SubmissionFlowScreen />);
    }).not.toThrow();
  });

  it('shows Next button', () => {
    const { getByText } = renderWithProviders(<SubmissionFlowScreen />);
    expect(getByText('Next')).toBeTruthy();
  });

  it('advances to step 2 after selecting type and pressing Next', () => {
    const { getByText, getByTestId } = renderWithProviders(<SubmissionFlowScreen />);

    // Select a type
    fireEvent.press(getByTestId('type-selector'));

    // Press Next
    fireEvent.press(getByText('Next'));

    // Now on step 2 - Pick Topic
    expect(getByText('Pick Topic')).toBeTruthy();
    expect(getByText('Step 2 of 5')).toBeTruthy();
  });

  it('step 2 shows topic search', () => {
    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<SubmissionFlowScreen />);
    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));

    expect(getByPlaceholderText('Search topics...')).toBeTruthy();
    expect(getByText('Propose a new topic')).toBeTruthy();
  });

  it('step 2 shows topic proposal form on press', () => {
    const { getByText, getByTestId } = renderWithProviders(<SubmissionFlowScreen />);
    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));

    fireEvent.press(getByText('Propose a new topic'));
    expect(getByTestId('topic-proposal')).toBeTruthy();
  });

  it('topic proposal submit sets topic name', () => {
    const { getByText, getByTestId } = renderWithProviders(<SubmissionFlowScreen />);
    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));

    fireEvent.press(getByText('Propose a new topic'));
    fireEvent.press(getByTestId('proposal-submit'));

    // After submitting proposal, can advance
    fireEvent.press(getByText('Next'));
    expect(getByText('Write Content')).toBeTruthy();
  });

  it('navigates through all steps to preview', () => {
    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<SubmissionFlowScreen />);

    // Step 1: Select type
    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));

    // Step 2: Pick topic
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'Grace');
    fireEvent.press(getByText(/Use "Grace"/));
    fireEvent.press(getByText('Next'));

    // Step 3: Write content
    expect(getByText('Write Content')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'My Title');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'My body text');
    fireEvent.press(getByText('Next'));

    // Step 4: Add verses
    expect(getByText('Add Verses')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('e.g., John 3:16'), 'John 3:16');
    fireEvent.press(getByText('Add'));
    expect(getByText('John 3:16 x')).toBeTruthy();

    fireEvent.press(getByText('Next'));

    // Step 5: Preview
    expect(getByTestId('preview')).toBeTruthy();
    expect(getByText('Submit')).toBeTruthy();
  });

  it('removes verse on press', () => {
    const { getByText, getByTestId, getByPlaceholderText, queryByText } = renderWithProviders(<SubmissionFlowScreen />);

    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'Test');
    fireEvent.press(getByText(/Use "Test"/));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'Body');
    fireEvent.press(getByText('Next'));

    // Add and remove verse
    fireEvent.changeText(getByPlaceholderText('e.g., John 3:16'), 'Romans 8:28');
    fireEvent.press(getByText('Add'));
    expect(getByText('Romans 8:28 x')).toBeTruthy();
    fireEvent.press(getByText('Romans 8:28 x'));
    expect(queryByText('Romans 8:28 x')).toBeNull();
  });

  it('goes back on header back press at step 0', () => {
    const { getByTestId } = renderWithProviders(<SubmissionFlowScreen />);
    fireEvent.press(getByTestId('header-back'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('goes back to previous step on header back press at step > 0', () => {
    const { getByText, getByTestId } = renderWithProviders(<SubmissionFlowScreen />);
    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    expect(getByText('Pick Topic')).toBeTruthy();
    fireEvent.press(getByTestId('header-back'));
    expect(getByText('Select Type')).toBeTruthy();
  });

  it('submit calls screenSubmission and shows alert on approve', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<SubmissionFlowScreen />);

    // Navigate through all steps
    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'Grace');
    fireEvent.press(getByText(/Use "Grace"/));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'My Title');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'My body');
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));

    // Press Submit
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(mockScreenSubmission).toHaveBeenCalled();
    });
    expect(alertSpy).toHaveBeenCalledWith('Submitted', expect.stringContaining('approved'), expect.any(Array));
    alertSpy.mockRestore();
  });

  it('shows rejection alert when submission is rejected', async () => {
    mockScreenSubmission.mockResolvedValue({ decision: 'reject', reason: 'Off topic' });
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<SubmissionFlowScreen />);

    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'X');
    fireEvent.press(getByText(/Use "X"/));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'T');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'B');
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Submission Not Accepted', 'Off topic');
    });
    alertSpy.mockRestore();
  });

  it('shows pending review for review decision', async () => {
    mockScreenSubmission.mockResolvedValue({ decision: 'review' });
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<SubmissionFlowScreen />);

    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'X');
    fireEvent.press(getByText(/Use "X"/));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'T');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'B');
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Submitted', expect.stringContaining('pending review'), expect.any(Array));
    });
    alertSpy.mockRestore();
  });

  it('handles submission error', async () => {
    mockScreenSubmission.mockRejectedValue(new Error('Network error'));
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText, getByTestId, getByPlaceholderText } = renderWithProviders(<SubmissionFlowScreen />);

    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'X');
    fireEvent.press(getByText(/Use "X"/));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'T');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'B');
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to submit. Please try again.');
    });
    alertSpy.mockRestore();
  });

  it('does not add duplicate verses', () => {
    const { getByText, getByTestId, getByPlaceholderText, getAllByText } = renderWithProviders(<SubmissionFlowScreen />);

    fireEvent.press(getByTestId('type-selector'));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Search topics...'), 'T');
    fireEvent.press(getByText(/Use "T"/));
    fireEvent.press(getByText('Next'));
    fireEvent.changeText(getByPlaceholderText('Give your submission a title'), 'T');
    fireEvent.changeText(getByPlaceholderText('Write your content...'), 'B');
    fireEvent.press(getByText('Next'));

    fireEvent.changeText(getByPlaceholderText('e.g., John 3:16'), 'John 3:16');
    fireEvent.press(getByText('Add'));
    fireEvent.changeText(getByPlaceholderText('e.g., John 3:16'), 'John 3:16');
    fireEvent.press(getByText('Add'));

    // Only one instance
    expect(getAllByText('John 3:16 x')).toHaveLength(1);
  });
});
