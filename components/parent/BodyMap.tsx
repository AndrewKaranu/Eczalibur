import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { BodyArea } from '@/lib/types';

interface BodyMapProps {
  selected: BodyArea[];
  onToggle: (area: BodyArea) => void;
}

const SELECTED_COLOR = '#ff4444';
const DEFAULT_COLOR = '#e8e8e8';
const STROKE_COLOR = '#999';

// Each region maps to a BodyArea key
interface Region {
  area: BodyArea;
  label: string;
  // SVG element type + props
}

/**
 * Simplified front+back body map.
 * All coordinates are within a 100×220 viewBox per figure.
 */
function BodyFigure({
  view,
  selected,
  onToggle,
}: {
  view: 'front' | 'back';
  selected: BodyArea[];
  onToggle: (area: BodyArea) => void;
}) {
  const fill = (area: BodyArea) => (selected.includes(area) ? SELECTED_COLOR : DEFAULT_COLOR);
  const s = STROKE_COLOR;
  const sw = '1';

  // Regions present on front: scalp, face, neck, chest, arms, hands, legs, feet
  // Regions present on back: scalp, neck, back, arms, hands, legs, feet
  const isFront = view === 'front';

  function tap(area: BodyArea) {
    onToggle(area);
  }

  return (
    <Svg width={100} height={220} viewBox="0 0 100 220">
      {/* ── Head / scalp ── */}
      <Pressable onPress={() => tap('scalp')}>
        <Circle cx={50} cy={18} r={14} fill={fill('scalp')} stroke={s} strokeWidth={sw} />
      </Pressable>

      {/* ── Face (front only) ── */}
      {isFront && (
        <Pressable onPress={() => tap('face')}>
          <Circle cx={50} cy={18} r={9} fill={fill('face')} stroke={s} strokeWidth={sw} />
        </Pressable>
      )}

      {/* ── Neck ── */}
      <Pressable onPress={() => tap('neck')}>
        <Rect x={44} y={31} width={12} height={10} rx={3} fill={fill('neck')} stroke={s} strokeWidth={sw} />
      </Pressable>

      {/* ── Torso (chest front / back rear) ── */}
      <Pressable onPress={() => tap(isFront ? 'chest' : 'back')}>
        <Path
          d="M30 42 Q25 44 24 60 L24 90 Q24 94 30 95 L70 95 Q76 94 76 90 L76 60 Q75 44 70 42 Z"
          fill={fill(isFront ? 'chest' : 'back')}
          stroke={s}
          strokeWidth={sw}
        />
      </Pressable>

      {/* ── Left arm ── */}
      <Pressable onPress={() => tap('arms')}>
        <Path
          d="M24 44 Q16 46 14 62 L14 88 Q14 92 18 92 L24 92 L24 44 Z"
          fill={fill('arms')}
          stroke={s}
          strokeWidth={sw}
        />
      </Pressable>

      {/* ── Right arm ── */}
      <Pressable onPress={() => tap('arms')}>
        <Path
          d="M76 44 Q84 46 86 62 L86 88 Q86 92 82 92 L76 92 L76 44 Z"
          fill={fill('arms')}
          stroke={s}
          strokeWidth={sw}
        />
      </Pressable>

      {/* ── Left hand ── */}
      <Pressable onPress={() => tap('hands')}>
        <Ellipse cx={16} cy={98} rx={6} ry={8} fill={fill('hands')} stroke={s} strokeWidth={sw} />
      </Pressable>

      {/* ── Right hand ── */}
      <Pressable onPress={() => tap('hands')}>
        <Ellipse cx={84} cy={98} rx={6} ry={8} fill={fill('hands')} stroke={s} strokeWidth={sw} />
      </Pressable>

      {/* ── Left leg ── */}
      <Pressable onPress={() => tap('legs')}>
        <Path
          d="M30 95 L30 165 Q30 168 34 168 L44 168 Q48 168 48 165 L48 95 Z"
          fill={fill('legs')}
          stroke={s}
          strokeWidth={sw}
        />
      </Pressable>

      {/* ── Right leg ── */}
      <Pressable onPress={() => tap('legs')}>
        <Path
          d="M70 95 L70 165 Q70 168 66 168 L56 168 Q52 168 52 165 L52 95 Z"
          fill={fill('legs')}
          stroke={s}
          strokeWidth={sw}
        />
      </Pressable>

      {/* ── Left foot ── */}
      <Pressable onPress={() => tap('feet')}>
        <Ellipse cx={34} cy={175} rx={8} ry={5} fill={fill('feet')} stroke={s} strokeWidth={sw} />
      </Pressable>

      {/* ── Right foot ── */}
      <Pressable onPress={() => tap('feet')}>
        <Ellipse cx={66} cy={175} rx={8} ry={5} fill={fill('feet')} stroke={s} strokeWidth={sw} />
      </Pressable>
    </Svg>
  );
}

export function BodyMap({ selected, onToggle }: BodyMapProps) {
  const AREAS: { area: BodyArea; label: string }[] = [
    { area: 'scalp', label: 'Scalp' },
    { area: 'face', label: 'Face' },
    { area: 'neck', label: 'Neck' },
    { area: 'chest', label: 'Chest' },
    { area: 'back', label: 'Back' },
    { area: 'arms', label: 'Arms' },
    { area: 'hands', label: 'Hands' },
    { area: 'legs', label: 'Legs' },
    { area: 'feet', label: 'Feet' },
    { area: 'other', label: 'Other' },
  ];

  return (
    <View>
      {/* Figures row */}
      <View style={styles.figureRow}>
        <View style={styles.figureCol}>
          <BodyFigure view="front" selected={selected} onToggle={onToggle} />
          <Text style={styles.viewLabel}>FRONT</Text>
        </View>
        <View style={styles.figureCol}>
          <BodyFigure view="back" selected={selected} onToggle={onToggle} />
          <Text style={styles.viewLabel}>BACK</Text>
        </View>
      </View>

      {/* Legend chips — tap figure OR chip to toggle */}
      <View style={styles.legend}>
        {AREAS.map(({ area, label }) => (
          <Pressable
            key={area}
            style={[styles.legendChip, selected.includes(area) && styles.legendChipSelected]}
            onPress={() => onToggle(area)}
          >
            <View style={[styles.legendDot, selected.includes(area) && styles.legendDotSelected]} />
            <Text style={[styles.legendText, selected.includes(area) && styles.legendTextSelected]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {selected.length > 0 && (
        <Text style={styles.selectionHint}>
          Selected: {selected.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  figureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  figureCol: {
    alignItems: 'center',
    gap: 6,
  },
  viewLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#2a2a3e',
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  legendChipSelected: {
    backgroundColor: '#3a1a1a',
    borderColor: '#ff4444',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e8e8e8',
  },
  legendDotSelected: {
    backgroundColor: '#ff4444',
  },
  legendText: {
    color: '#aaa',
    fontSize: 12,
  },
  legendTextSelected: {
    color: '#ff4444',
    fontWeight: '600',
  },
  selectionHint: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
