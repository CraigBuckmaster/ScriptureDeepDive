/**
 * TreeNode — Circular avatar node with initial letter inside, full name below.
 *
 * Visibility and culling are handled upstream in useVisibleNodes; by the
 * time a TreeNode mounts, the parent has already decided it belongs on
 * screen. All this component does is draw the circle + initial + name
 * at the right opacity.
 *
 * An entrance fade (opacity 0 → 1 over ~3 animation frames) runs when
 * `isEntering` is true on the first render. This softens the pop-in
 * effect that viewport culling would otherwise produce at viewport
 * edges and tier-threshold crossings.
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { LayoutNode, TreePerson } from '../../utils/treeBuilder';
import { isMessianic } from '../../utils/messianicLine';

// ── Circle dimensions ─────────────────────────────────────────────────
const SPINE_R = 24;            // 48 px diameter
const SAT_R = 18;              // 36 px diameter

// Initial letter inside the circle
const SPINE_INITIAL_FONT = 18;
const SAT_INITIAL_FONT = 14;

// Full name below the circle
const NAME_FONT_SPINE = 10;
const NAME_FONT_SAT = 9;
const NAME_GAP = 8;            // circle bottom edge → name baseline

// Accessibility — every interactive node should have a 44 pt touch target
const MIN_TOUCH_H = 44;

// Flat fills — match the wireframe's dark backgrounds
const SPINE_FILL = '#1a1810'; // data-color: intentional (SVG spine node fill — warm-dark bg)
const SAT_FILL = '#181612';   // data-color: intentional (SVG satellite node fill — warm-dark bg)

interface Props {
  node: LayoutNode;
  dimmed: boolean;
  selected: boolean;
  /** True when the node first entered the visible set — triggers fade-in. */
  isEntering?: boolean;
  onPress: (person: TreePerson) => void;
}

export const TreeNode = memo(function TreeNode({
  node, dimmed, selected, isEntering = false, onPress,
}: Props) {
  const { base } = useTheme();
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const onMessianicLine = isMessianic(data.id);
  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Entrance fade: step through 0 → 0.4 → 0.7 → 1 across a few RAF
  // ticks. react-native-svg doesn't animate `opacity` natively, but
  // three discrete jumps over ~50ms are enough to soften pop-in.
  const [fadeOpacity, setFadeOpacity] = useState(isEntering ? 0 : 1);
  useEffect(() => {
    if (!isEntering) return;
    let cancelled = false;
    let frame = 0;
    const tick = () => {
      if (cancelled) return;
      frame += 1;
      if (frame === 1) setFadeOpacity(0.4);
      else if (frame === 2) setFadeOpacity(0.7);
      else if (frame === 3) { setFadeOpacity(1); return; }
      requestAnimationFrame(tick);
    };
    const handle = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(handle);
    };
    // Intentionally only runs on mount — isEntering is a transient flag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAssociate = data.isAssociate === true;
  const opacity = fadeOpacity
    * (dimmed ? 0.25 : 1)
    * (isAssociate ? 0.75 : 1);

  // Geometry — associate satellites render slightly smaller to read as
  // "off-tree" contemporaries rather than genealogical descendants.
  const r = isSpine ? SPINE_R : (isAssociate ? SAT_R - 3 : SAT_R);
  const initialFont = isSpine ? SPINE_INITIAL_FONT : SAT_INITIAL_FONT;
  const nameFont = isSpine ? NAME_FONT_SPINE : NAME_FONT_SAT;

  // Border color logic: selected > messianic > spine > satellite
  let borderColor: string;
  let borderWidth: number;
  if (selected) {
    borderColor = base.goldBright;
    borderWidth = 2;
  } else if (onMessianicLine) {
    borderColor = base.gold + '60';
    borderWidth = 1.5;
  } else if (isSpine) {
    borderColor = base.gold + '30';
    borderWidth = 1;
  } else {
    borderColor = base.border;
    borderWidth = 1;
  }

  // Fill — messianic uses the radial gradient defined on TreeCanvas;
  // everything else uses a flat dark colour.
  const nodeFill = onMessianicLine
    ? 'url(#messianic-node-fill)'
    : (isSpine ? SPINE_FILL : SAT_FILL);

  // Initial letter — first character of the person's name, uppercased
  const initial = (data.name?.[0] ?? '').toUpperCase();

  // Name colour — messianic + spine show full text; satellites are dim
  const nameFill = onMessianicLine
    ? base.gold
    : (isSpine ? base.text : base.textDim);

  // Initial colour — gold inside messianic, light text inside spine, dim text inside satellite
  const initialFill = onMessianicLine
    ? base.gold
    : (isSpine ? base.text : base.textDim);

  const needsTouchTarget = r * 2 < MIN_TOUCH_H;

  return (
    <G onPress={handlePress} opacity={opacity}>
      {/* Invisible touch target so small satellite circles still hit 44 pt. */}
      {needsTouchTarget && (
        <Rect
          x={x - MIN_TOUCH_H / 2}
          y={y - MIN_TOUCH_H / 2}
          width={MIN_TOUCH_H}
          height={MIN_TOUCH_H}
          fill="transparent"
        />
      )}

      {/* Main circle */}
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill={nodeFill}
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeDasharray={isAssociate ? '2,2' : undefined}
      />

      {/* Initial letter, visually centred in the circle */}
      <SvgText
        x={x}
        y={y + initialFont * 0.35}
        textAnchor="middle"
        fontSize={initialFont}
        fill={initialFill}
        fontFamily="Cinzel_600SemiBold"
        fontWeight="600"
      >
        {initial}
      </SvgText>

      {/* Full name below the circle */}
      <SvgText
        x={x}
        y={y + r + NAME_GAP}
        textAnchor="middle"
        fontSize={nameFont}
        fill={nameFill}
        fontFamily="SourceSans3_400Regular"
        fontWeight={isSpine || onMessianicLine ? '600' : '400'}
      >
        {data.name}
      </SvgText>
    </G>
  );
});
