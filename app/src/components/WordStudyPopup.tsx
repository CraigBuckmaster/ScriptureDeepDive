import { View, Text, TouchableOpacity } from 'react-native';
import { base } from '../theme';

interface Props { visible: boolean; onClose: () => void; data?: any; }

export function WordStudyPopup({ visible, onClose, data }: Props) {
  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: base.bgElevated, borderTopWidth: 1,
      borderTopColor: base.border, padding: 16, minHeight: 200 }}>
      <Text style={{ color: base.text, fontSize: 16 }}>WordStudyPopup</Text>
      <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
        <Text style={{ color: base.gold }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}
