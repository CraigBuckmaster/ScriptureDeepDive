/**
 * DiscoursePanel — Collapsible argument tree renderer.
 *
 * Displays the logical flow of an argument in epistles and theological texts.
 * Shows thesis, discourse nodes (premises, grounds, conclusions), and connectors.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

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
  thesis: '#bfa050',       // data-color: intentional (gold)
  premise: '#70b8e8',      // data-color: intentional (blue)
  ground: '#70d098',       // data-color: intentional (green)
  inference: '#c090e0',    // data-color: intentional (purple)
  conclusion: '#e8a070',   // data-color: intentional (orange)
  contrast: '#e07070',     // data-color: intentional (red)
  concession: '#a0a0c0',   // data-color: intentional (gray-blue)
  purpose: '#80c8c0',      // data-color: intentional (teal)
  result: '#d8b870',       // data-color: intentional (warm gold)
  illustration: '#b8a090', // data-color: intentional (taupe)
  exhortation: '#e890b8',  // data-color: intentional (pink)
  doxology: '#c8c080',     // data-color: intentional (olive gold)
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
  const { base } = useTheme();
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
      <View style={[styles.nodeCard, { borderLeftColor: color, backgroundColor: base.bgElevated }]}>
        {/* Header row */}
        <View style={styles.nodeHeader}>
          <View style={styles.nodeHeaderLeft}>
            {hasChildren && (
              <TouchableOpacity
                onPress={toggleExpand}
                style={styles.expandButton}
                accessibilityRole="button"
                accessibilityLabel={expanded ? `Collapse ${label} node` : `Expand ${label} node`}
              >
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
              <Text style={[styles.marker, { color: base.textDim }]}>{node.marker}</Text>
            )}
          </View>
          <Text style={[styles.verseRange, { color: base.gold }]}>{node.verse_range}</Text>
        </View>

        {/* Text content */}
        <Text style={[styles.nodeText, { color: base.textDim }, depth > 0 && styles.nodeTextSmall]}>
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
  const { base } = useTheme();

  if (!data || !data.nodes) {
    return (
      <Text style={[styles.emptyText, { color: base.textMuted }]}>No argument structure data available.</Text>
    );
  }

  return (
    <View style={styles.container}>
      {/* Thesis callout */}
      {data.thesis && (
        <View style={[styles.thesisBox, { backgroundColor: base.bgElevated, borderLeftColor: base.gold }]}>
          <Text style={[styles.thesisLabel, { color: base.gold }]}>MAIN THESIS</Text>
          <Text style={[styles.thesisText, { color: base.text }]}>{data.thesis}</Text>
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
        <Text style={[styles.noteText, { color: base.textMuted }]}>{data.note}</Text>
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
    borderLeftWidth: 3,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  thesisLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  thesisText: {
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
    borderRadius: radii.sm,
  },
  typeBadgeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  marker: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  verseRange: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 11,
  },
  nodeText: {
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
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },
});
