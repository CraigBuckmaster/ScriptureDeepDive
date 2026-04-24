import type { AmicusCitation } from '@/types';

export type AmicusTrustStance = 'debated';

export interface AmicusTrustSummary {
  sourceCount: number;
  labels: string[];
  stance: AmicusTrustStance | null;
  hasTrustSignals: boolean;
}

function uniqueLabels(citations: AmicusCitation[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const citation of citations) {
    const label = citation.display_label.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

export function summarizeAmicusTrust(
  citations: AmicusCitation[],
): AmicusTrustSummary {
  const labels = uniqueLabels(citations);
  const stance: AmicusTrustStance | null = citations.some(
    (citation) => citation.source_type === 'debate_topic',
  )
    ? 'debated'
    : null;

  return {
    sourceCount: labels.length,
    labels,
    stance,
    hasTrustSignals: labels.length > 0 || stance !== null,
  };
}

export function formatTrustStanceLabel(
  stance: AmicusTrustStance,
): string {
  switch (stance) {
    case 'debated':
      return 'Debated';
  }
}
