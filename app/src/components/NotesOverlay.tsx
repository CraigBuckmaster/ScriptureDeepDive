import { Modal, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { base } from '../theme';

interface Props { visible: boolean; onClose: () => void; }

export function NotesOverlay({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: base.text, fontSize: 16 }}>NotesOverlay</Text>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16 }}>
            <Text style={{ color: base.gold }}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
