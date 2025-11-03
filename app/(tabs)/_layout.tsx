import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0a7ea4', // Blue for active
        tabBarInactiveTintColor: '#687076', // Gray for inactive
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="work"
        options={{
          title: '✅ Work',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'checkmark.circle.fill' : 'checkmark.circle'}
              color={focused ? '#0a7ea4' : color}
            />
          ),
          tabBarLabel: '✅ Work',
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: '📋 Status',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'chart.line.uptrend.xyaxis.fill' : 'chart.line.uptrend.xyaxis'}
              color={focused ? '#0a7ea4' : '#FF69B4'}
            />
          ),
          tabBarLabel: '📋 Status',
        }}
      />
      <Tabs.Screen
        name="callogs"
        options={{
          title: '📞 Callogs',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'phone.fill' : 'phone'}
              color={focused ? '#0a7ea4' : '#FF69B4'}
            />
          ),
          tabBarLabel: '📞 Callogs',
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '📊 Statistics',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'chart.bar.fill' : 'chart.bar'}
              color={focused ? '#0a7ea4' : '#34C759'}
            />
          ),
          tabBarLabel: '📊 Statistics',
        }}
      />
    </Tabs>
  );
}
