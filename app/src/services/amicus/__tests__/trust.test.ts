import {
  formatTrustStanceLabel,
  summarizeAmicusTrust,
} from '@/services/amicus/trust';
import type { AmicusCitation } from '@/types';

describe('amicus trust helpers', () => {
  it('summarizes unique source labels and detects debated stance', () => {
    const citations: AmicusCitation[] = [
      {
        chunk_id: 'debate_topic:election',
        source_type: 'debate_topic',
        display_label: 'Election Debate',
      },
      {
        chunk_id: 'section_panel:romans-9-s1-calvin',
        source_type: 'section_panel',
        display_label: 'Calvin · Romans 9',
      },
      {
        chunk_id: 'section_panel:romans-9-s1-calvin-2',
        source_type: 'section_panel',
        display_label: 'Calvin · Romans 9',
      },
    ];

    expect(summarizeAmicusTrust(citations)).toEqual({
      sourceCount: 2,
      labels: ['Election Debate', 'Calvin · Romans 9'],
      stance: 'debated',
      hasTrustSignals: true,
    });
  });

  it('returns an empty summary when there are no citations', () => {
    expect(summarizeAmicusTrust([])).toEqual({
      sourceCount: 0,
      labels: [],
      stance: null,
      hasTrustSignals: false,
    });
  });

  it('formats debated stance for display', () => {
    expect(formatTrustStanceLabel('debated')).toBe('Debated');
  });
});
