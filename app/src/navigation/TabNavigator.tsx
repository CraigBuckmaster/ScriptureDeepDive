import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Library, GraduationCap, Search, MessageSquare, MoreHorizontal } from 'lucide-react-native';
import { isFlagEnabled } from '../config/featureFlags';
import { useSettingsStore } from '../stores';
import { useTheme } from '../theme';
import { AmicusStack } from './AmicusStack';
import { ExploreStack } from './ExploreStack';
import { HomeStack } from './HomeStack';
import { MoreStack } from './MoreStack';
import { ReadStack } from './ReadStack';
import { SearchStack } from './SearchStack';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { base } = useTheme();
  const amicusEnabled = useSettingsStore((s) => s.amicusEnabled);

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
          tabPress: () => {
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
          tabPress: () => {
            navigation.navigate('ReadTab', { screen: 'BookList' });
          },
        })}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Study',
          tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Route names are stable (#1832): the tab renames to Study but the
            // stack/routes stay ExploreTab/ExploreMenu. The hub only becomes
            // the tab-press target behind the study_hub flag.
            navigation.navigate('ExploreTab', {
              screen: isFlagEnabled('study_hub') ? 'StudyHub' : 'ExploreMenu',
            });
          },
        })}
      />
      {amicusEnabled && (
        <Tab.Screen
          name="AmicusTab"
          component={AmicusStack}
          options={{
            tabBarLabel: 'Amicus',
            tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('AmicusTab', { screen: 'ThreadList' });
            },
          })}
        />
      )}
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('SearchTab', { screen: 'SearchMain' });
          },
        })}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('MoreTab', { screen: 'MoreMenu' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
