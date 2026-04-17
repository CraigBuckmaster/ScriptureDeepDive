import {
  extractDeltaText,
  parseAssistantMessage,
} from '../streamParser';

describe('extractDeltaText', () => {
  it('pulls content_block_delta text fragments', () => {
    const chunk =
      'data: {"type":"content_block_delta","delta":{"text":"Hello "}}\n' +
      'data: {"type":"content_block_delta","delta":{"text":"world"}}\n';
    expect(extractDeltaText(chunk)).toBe('Hello world');
  });

  it('ignores [DONE] sentinel and other event types', () => {
    const chunk =
      'data: [DONE]\n' +
      'data: {"type":"message_stop"}\n' +
      'data: {"type":"content_block_delta","delta":{"text":"ok"}}\n';
    expect(extractDeltaText(chunk)).toBe('ok');
  });

  it('tolerates non-JSON data lines', () => {
    expect(extractDeltaText('data: garbage\n')).toBe('');
  });
});

describe('parseAssistantMessage — citations', () => {
  it('extracts [CITE:...] markers into pill nodes', () => {
    const text =
      'Reformed scholars like Calvin emphasize election [CITE:section_panel:romans-9-s1-calvin]. ' +
      'Jewish scholars emphasize covenant [CITE:section_panel:exodus-33-s2-sarna].';
    const parsed = parseAssistantMessage(text);
    expect(parsed.citations).toHaveLength(2);
    expect(parsed.citations[0]!.chunk_id).toBe('section_panel:romans-9-s1-calvin');
    expect(parsed.citations[0]!.scholar_id).toBe('calvin');
    expect(parsed.citations[0]!.display_label).toContain('Calvin');
  });

  it('supports the plain [chunk_id] form', () => {
    const text = 'See [word_study:hesed] for details.';
    const parsed = parseAssistantMessage(text);
    expect(parsed.citations[0]!.chunk_id).toBe('word_study:hesed');
  });

  it('dedupes repeated citations', () => {
    const text =
      'First [word_study:hesed] and again [word_study:hesed] in Psalm 23.';
    const parsed = parseAssistantMessage(text);
    expect(parsed.citations).toHaveLength(1);
  });

  it('preserves unknown source types as literal text', () => {
    const text = 'See [bogus_type:foo] reference.';
    const parsed = parseAssistantMessage(text);
    expect(parsed.citations).toHaveLength(0);
    expect(parsed.prose).toContain('[bogus_type:foo]');
  });

  it('emits interleaved text + citation nodes in order', () => {
    const text = 'A [word_study:hesed] B [word_study:shalom] C';
    const parsed = parseAssistantMessage(text);
    expect(parsed.nodes[0]).toEqual({ type: 'text', text: 'A ' });
    expect(parsed.nodes[1]!.type).toBe('citation');
    expect(parsed.nodes[3]!.type).toBe('citation');
    expect(parsed.nodes[4]).toEqual({ type: 'text', text: ' C' });
  });
});

describe('parseAssistantMessage — envelopes', () => {
  it('strips trailing gap envelope', () => {
    const text = 'Answer here.\n{"gap": false}';
    const parsed = parseAssistantMessage(text);
    expect(parsed.gap_signal?.gap).toBe(false);
    expect(parsed.prose).toBe('Answer here.');
  });

  it('parses gap=true with gap_type + topic', () => {
    const text = 'No corpus for that.\n{"gap": true, "gap_type": "content", "topic": "Coptic"}';
    const parsed = parseAssistantMessage(text);
    expect(parsed.gap_signal).toEqual({
      gap: true,
      gap_type: 'content',
      topic: 'Coptic',
    });
  });

  it('parses follow_ups envelope alongside gap envelope', () => {
    const text =
      'Prose with [word_study:hesed] inline.\n' +
      '{"follow_ups": ["What about agape?", "Is hesed used in NT?", "Connection to grace?"]}\n' +
      '{"gap": false}';
    const parsed = parseAssistantMessage(text);
    expect(parsed.follow_ups).toEqual([
      'What about agape?',
      'Is hesed used in NT?',
      'Connection to grace?',
    ]);
    expect(parsed.gap_signal?.gap).toBe(false);
    expect(parsed.prose).toContain('inline');
    expect(parsed.prose).not.toContain('follow_ups');
  });

  it('keeps trailing non-JSON braces as prose', () => {
    const parsed = parseAssistantMessage('The set is { empty }');
    expect(parsed.gap_signal).toBeNull();
    expect(parsed.prose).toContain('empty');
  });

  it('normalizes CITE markers to [chunk_id] in prose', () => {
    const text = 'Read Calvin [CITE:section_panel:romans-9-s1-calvin] closely.';
    expect(parseAssistantMessage(text).prose).toContain(
      '[section_panel:romans-9-s1-calvin]',
    );
  });

  it('caps follow_ups at 3', () => {
    const text =
      'Prose.\n{"follow_ups": ["a", "b", "c", "d", "e"]}\n{"gap": false}';
    const parsed = parseAssistantMessage(text);
    expect(parsed.follow_ups).toHaveLength(3);
  });
});
