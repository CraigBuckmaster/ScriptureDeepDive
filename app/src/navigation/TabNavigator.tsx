import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
          fontSize: 10,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ReadTab"
        component={ReadStack}
        options={{ tabBarLabel: 'Read' }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}
