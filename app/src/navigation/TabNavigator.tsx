import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Library, Compass, Search, MoreHorizontal } from 'lucide-react-native';
import { HomeStack } from './HomeStack';
import { ReadStack } from './ReadStack';
import { ExploreStack } from './ExploreStack';
import { SearchStack } from './SearchStack';
import { MoreStack } from './MoreStack';
import { base } from '../theme';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: base.bg,
          borderTopColor: base.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: base.gold,
        tabBarInactiveTintColor: base.textMuted,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('HomeTab', { screen: 'HomeMain' });
          },
        })}
      />
      <Tab.Screen
        name="ReadTab"
        component={ReadStack}
        options={{
          tabBarLabel: 'Read',
          tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('ReadTab', { screen: 'BookList' });
          },
        })}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('ExploreTab', { screen: 'ExploreMenu' });
          },
        })}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('MoreTab', { screen: 'MoreMenu' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
