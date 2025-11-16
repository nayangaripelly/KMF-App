import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SFSymbols6_0 } from 'sf-symbols-typescript';

interface BottomNavProps {
  activeTab: 'assign' | 'status' | 'statistics';
}

export default function AdminBottomNav({ activeTab }: BottomNavProps) {

  const navItems = [
    {
      id: 'assign',
      label: 'Assign Work',
      icon: 'checkmark.circle',
      route: '/admin/assign',
    },
    {
      id: 'status',
      label: 'Status',
      icon: 'phone',
      route: '/admin/status',
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: 'chart.bar',
      route: '/admin/statistics',
    },
  ];

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => handleNavigate(item.route)}
            activeOpacity={0.7}>
            <IconSymbol
              name={isActive ? `${item.icon}.fill` as SFSymbols6_0 : item.icon as SFSymbols6_0}
              size={24}
              color={isActive ? '#0a7ea4' : '#687076'}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#687076',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});

