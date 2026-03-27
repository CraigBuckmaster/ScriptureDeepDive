/**
 * DiscoursePanel — Collapsible argument tree renderer.
 *
 * Displays the logical flow of an argument in epistles and theological texts.
 * Shows thesis, discourse nodes (premises, grounds, conclusions), and connectors.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { base, spacing, radii, fontFamily } from '../../theme';

// ── Types ────────────────────────────────────────────────────────────

type NodeType =
  | 'thesis'
  | 'premise'
  | 'ground'
  | 'inference'
  | 'conclusion'
  | 'contrast'
  | 'concession'
  | 'purpose'
  | 'result'
  | 'illustration'
  | 'exhortation'
  | 'doxology';

interface DiscourseNode {
  id: string;
  type: NodeType;
  verse_range: string;
  marker?: string;      // "Therefore", "For", "But", etc.
  text: string;
  children?: DiscourseNode[];
}

interface DiscourseData {
  thesis: string;
  nodes: DiscourseNode[];
  connectors?: { from: string; to: string; label: string }[];
  note?: string;
}

interface Props {
  data: DiscourseData;
}

// ── Color mapping by node type ───────────────────────────────────────

const NODE_TYPE_COLORS: Record<NodeType, string> = {
  thesis: '#bfa050',       // gold
  premise: '#70b8e8',      // blue
  ground: '#70d098',       // green
  inference: '#c090e0',    // purple
  conclusion: '#e8a070',   // orange
  contrast: '#e07070',     // red
  concession: '#a0a0c0',   // gray-blue
  purpose: '#80c8c0',      // teal
  result: '#d8b870',       // warm gold
  illustration: '#b8a090', // taupe
  exhortation: '#e890b8',  // pink
  doxology: '#c8c080',     // olive gold
};

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  thesis: 'Thesis',
  premise: 'Premise',
  ground: 'Ground',
  inference: 'Inference',
  conclusion: 'Conclusion',
  contrast: 'Contrast',
  concession: 'Concession',
  purpose: 'Purpose',
  result: 'Result',
  illustration: 'Illustration',
  exhortation: 'Exhortation',
  doxology: 'Doxology',
};

// ── Node Component ───────────────────────────────────────────────────

interface NodeCardProps {
  node: DiscourseNode;
  depth: number;
}

function NodeCard({ node, depth }: NodeCardProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const color = NODE_TYPE_COLORS[node.type] || base.gold;
  const label = NODE_TYPE_LABELS[node.type] || node.type;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={[styles.nodeWrapper, { marginLeft: depth * 16 }]}>
      <View style={[styles.nodeCard, { borderLeftColor: color }]}>
        {/* Header row */}
        <View style={styles.nodeHeader}>
          <View style={styles.nodeHeaderLeft}>
            {hasChildren && (
              <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                {expanded ? (
                  <ChevronDown size={14} color={base.textMuted} />
                ) : (
                  <ChevronRight size={14} color={base.textMuted} />
                )}
              </TouchableOpacity>
            )}
            <View style={[styles.typeBadge, { backgroundColor: color + '30' }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{label}</Text>
            </View>
            {node.marker && (
              <Text style={styles.marker}>{node.marker}</Text>
            )}
          </View>
          <Text style={styles.verseRange}>{node.verse_range}</Text>
        </View>

        {/* Text content */}
        <Text style={[styles.nodeText, depth > 0 && styles.nodeTextSmall]}>
          {node.text}
        </Text>
      </View>

      {/* Children (if expanded) */}
      {hasChildren && expanded && (
        <View style={styles.childrenContainer}>
          {node.children!.map((child) => (
            <NodeCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────

export function DiscoursePanel({ data }: Props) {
  if (!data || !data.nodes) {
    return (
      <Text style={styles.emptyText}>No argument structure data available.</Text>
    );
  }

  return (
    <View style={styles.container}>
      {/* Thesis callout */}
      {data.thesis && (
        <View style={styles.thesisBox}>
          <Text style={styles.thesisLabel}>MAIN THESIS</Text>
          <Text style={styles.thesisText}>{data.thesis}</Text>
        </View>
      )}

      {/* Argument nodes */}
      <View style={styles.nodesContainer}>
        {data.nodes.map((node) => (
          <NodeCard key={node.id} node={node} depth={0} />
        ))}
      </View>

      {/* Note */}
      {data.note && (
        <Text style={styles.noteText}>{data.note}</Text>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  thesisBox: {
    backgroundColor: base.bgElevated,
    borderLeftWidth: 3,
    borderLeftColor: base.gold,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  thesisLabel: {
    color: base.gold,
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  thesisText: {
    color: base.text,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  nodesContainer: {
    gap: spacing.sm,
  },
  nodeWrapper: {
    marginBottom: spacing.xs,
  },
  nodeCard: {
    backgroundColor: base.bgElevated,
    borderLeftWidth: 3,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nodeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandButton: {
    padding: 2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  typeBadgeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  marker: {
    color: base.textDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  verseRange: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 11,
  },
  nodeText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  nodeTextSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  childrenContainer: {
    marginTop: spacing.xs,
  },
  noteText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },
});
