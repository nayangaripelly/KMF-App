import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SFSymbols6_0 } from 'sf-symbols-typescript';
import { Text as RNText } from 'react-native';

export default function FieldPersonTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#687076',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="work"
        options={{
          title: '🚶 Work',
          tabBarLabel: 'Work',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'checkmark.circle.fill' : 'checkmark.circle'}
              color={focused ? '#0a7ea4' : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: '📋 Meet Status',
          tabBarLabel: 'Status',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={
                focused
                  ? ('chart.line.uptrend.xyaxis.fill' as SFSymbols6_0)
                  : ('chart.line.uptrend.xyaxis' as SFSymbols6_0)
              }
              color={focused ? '#0a7ea4' : '#FF8C42'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meetlogs"
        options={{
          title: '📋 MeetLogs',
          tabBarLabel: 'MeetLogs',
          tabBarIcon: ({ color, focused }) => (
            // <IconSymbol
            //   size={24}
            //   name={
            //     focused
            //       ? ('doc.text.fill' as SFSymbols6_0)
            //       : ('doc.text' as SFSymbols6_0)
            //   }
            //   color={focused ? '#0a7ea4' : '#FF69B4'}
            // />
            <RNText style={{ fontSize: 22 }}>
              {focused ? '📋' : '📄'}
            </RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '📊 Statistics',
          tabBarLabel: 'Statistics',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? 'chart.bar.fill' : 'chart.bar'}
              color={focused ? '#0a7ea4' : '#34C759'}
            />
          ),
        }}
      />
    </Tabs>
  );
}

