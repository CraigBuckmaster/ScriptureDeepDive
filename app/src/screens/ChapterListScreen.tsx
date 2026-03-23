import { View, Text } from 'react-native';
import { base } from '../theme';

export default function ChapterListScreen({ route }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: base.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: base.text, fontSize: 16 }}>ChapterListScreen</Text>
      <Text style={{ color: base.textMuted, fontSize: 12, marginTop: 4 }}>
        {route?.params ? JSON.stringify(route.params).slice(0, 80) : 'No params'}
      </Text>
    </View>
  );
}
