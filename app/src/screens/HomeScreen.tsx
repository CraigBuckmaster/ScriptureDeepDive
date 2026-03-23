import { View, Text } from 'react-native';
import { base } from '../theme';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: base.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: base.gold, fontSize: 20 }}>Scripture Deep Dive</Text>
      <Text style={{ color: base.textDim, marginTop: 8 }}>Home</Text>
    </View>
  );
}
