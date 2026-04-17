/**
 * components/amicus/AssistantMessageBubble.tsx — prose + inline citation
 * pills, with an optional streaming indicator after the last token.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { parseAssistantMessage } from '../../services/amicus/streamParser';
import type { AmicusCitation } from '../../types';
import { fontFamily, useTheme } from '../../theme';
import StreamingDot from './StreamingDot';
import CitationPill from './CitationPill';

export interface AssistantMessageBubbleProps {
  content: string;
  citations: AmicusCitation[];
  isStreaming: boolean;
  onCitationPress?: (citation: AmicusCitation) => void;
}

export default function AssistantMessageBubble(
  props: AssistantMessageBubbleProps,
): React.ReactElement {
  const { base } = useTheme();
  const parsed = parseAssistantMessage(props.content);
  const citationByChunk = new Map(props.citations.map((c) => [c.chunk_id, c]));

  return (
    <View style={[styles.bubble, { backgroundColor: base.bgSurface }]}>
      <Text style={[styles.prose, { color: base.text, fontFamily: fontFamily.body }]}>
        {parsed.nodes.map((node, i) => {
          if (node.type === 'text') return <Text key={i}>{node.text}</Text>;
          const full = citationByChunk.get(node.pill.chunk_id);
          const label = full?.display_label ?? node.pill.display_label;
          const scholar = full?.scholar_id ?? node.pill.scholar_id;
          return (
            <Text key={i}>
              {' '}
              <CitationPill
                chunkId={node.pill.chunk_id}
                sourceType={node.pill.source_type}
                displayLabel={label}
                scholarId={scholar}
                onPress={full ? () => props.onCitationPress?.(full) : undefined}
              />
              {' '}
            </Text>
          );
        })}
        {props.isStreaming && <StreamingDot />}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  prose: { fontSize: 15, lineHeight: 22 },
});
