import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useTheme, spacing, fontFamily } from '../../theme';

interface ThemeScore {
  label?: string;
  name?: string;
  score?: number;
  value?: number;
}

interface Props { data: { scores: ThemeScore[]; note?: string }; }

const SIZE = 240;
const CENTER = SIZE / 2;
const MAX_R = 95;

export function ThemesRadarPanel({ data }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('themes');
  if (!data?.scores?.length) return null;

  const n = data.scores.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = (value / 10) * MAX_R;
    return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
  };

  const polyPoints = data.scores
    .map((s, i) => getPoint(i, s.score ?? s.value ?? 0))
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Concentric circles */}
        {[2, 4, 6, 8, 10].map((v) => (
          <Circle key={v} cx={CENTER} cy={CENTER} r={(v / 10) * MAX_R}
            stroke={base.border} strokeWidth={0.5} fill="none" />
        ))}
        {/* Axis lines + labels */}
        {data.scores.map((s, i) => {
          const [x, y] = getPoint(i, 10);
          const [lx, ly] = getPoint(i, 12.5);
          const label = s.label ?? s.name ?? '';
          return (
            <React.Fragment key={i}>
              <Line x1={CENTER} y1={CENTER} x2={x} y2={y}
                stroke={base.border} strokeWidth={0.5} />
              <SvgText x={lx} y={ly + 3} fontSize={8} fill={base.textMuted}
                textAnchor="middle" fontFamily="SourceSans3_400Regular">
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
        {/* Score polygon */}
        <Polygon points={polyPoints}
          fill={colors.accent + '30'} stroke={colors.accent} strokeWidth={1.5} />
      </Svg>
      {data.note ? (
        <Text style={[styles.noteText, { color: base.textMuted }]}>
          {data.note}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  noteText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
