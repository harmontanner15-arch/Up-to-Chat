import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { AlertsScreen } from '../screens/AlertsScreen';
import { CirclesScreen } from '../screens/CirclesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.border,
    primary: colors.accent,
    text: colors.textPrimary,
  },
};

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name={name} size={24} color={focused ? colors.accent : colors.textMuted} />
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          marginTop: 4,
          backgroundColor: focused ? colors.accent : 'transparent',
        }}
      />
    </View>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            height: 84,
            paddingTop: 8,
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="circles"
          component={CirclesScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'radio-button-on-outline' : 'ellipse-outline'} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="alerts"
          component={AlertsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'notifications' : 'notifications-outline'} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
