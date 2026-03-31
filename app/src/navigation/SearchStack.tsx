import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../screens/SearchScreen';
import { useTheme } from '../theme';
import type { SearchStackParamList } from './types';

const Stack = createStackNavigator<SearchStackParamList>();

export function SearchStack() {
  const { base } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: base.bg } }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
    </Stack.Navigator>
  );
}
