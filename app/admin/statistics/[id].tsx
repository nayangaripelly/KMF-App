import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

type TimeSpan = 'today' | 'week' | 'month' | 'year' | 'all';

interface StatisticCard {
  label: string;
  value: string | number;
  icon: string;
}

export default function SalespersonStatisticsPage() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const salespersonName = name || 'Salesperson';
  const [selectedTimespan, setSelectedTimespan] = useState<TimeSpan>('month');

  const getStatistics = (timespan: TimeSpan): StatisticCard[] => {
    const dataByTimespan = {
      today: [
        { label: 'Total Calls', value: 12, icon: 'phone.fill' },
        { label: 'Connected Calls', value: 8, icon: 'checkmark.circle.fill' },
        { label: 'Missed Calls', value: 4, icon: 'phone.arrow.up.right.fill' },
        { label: 'Visits Done', value: 3, icon: 'mappin.fill' },
        { label: 'Loans Converted', value: 1, icon: 'chart.line.uptrend.xyaxis.fill' },
        { label: 'Distance Traveled', value: '45 km', icon: 'location.fill' },
      ],
      week: [
        { label: 'Total Calls', value: 68, icon: 'phone.fill' },
        { label: 'Connected Calls', value: 52, icon: 'checkmark.circle.fill' },
        { label: 'Missed Calls', value: 16, icon: 'phone.arrow.up.right.fill' },
        { label: 'Visits Done', value: 14, icon: 'mappin.fill' },
        { label: 'Loans Converted', value: 4, icon: 'chart.line.uptrend.xyaxis.fill' },
        { label: 'Distance Traveled', value: '287 km', icon: 'location.fill' },
      ],
      month: [
        { label: 'Total Calls', value: 286, icon: 'phone.fill' },
        { label: 'Connected Calls', value: 214, icon: 'checkmark.circle.fill' },
        { label: 'Missed Calls', value: 72, icon: 'phone.arrow.up.right.fill' },
        { label: 'Visits Done', value: 52, icon: 'mappin.fill' },
        { label: 'Loans Converted', value: 18, icon: 'chart.line.uptrend.xyaxis.fill' },
        { label: 'Distance Traveled', value: '1,240 km', icon: 'location.fill' },
      ],
      year: [
        { label: 'Total Calls', value: 3224, icon: 'phone.fill' },
        { label: 'Connected Calls', value: 2418, icon: 'checkmark.circle.fill' },
        { label: 'Missed Calls', value: 806, icon: 'phone.arrow.up.right.fill' },
        { label: 'Visits Done', value: 612, icon: 'mappin.fill' },
        { label: 'Loans Converted', value: 218, icon: 'chart.line.uptrend.xyaxis.fill' },
        { label: 'Distance Traveled', value: '14,800 km', icon: 'location.fill' },
      ],
      all: [
        { label: 'Total Calls', value: 8956, icon: 'phone.fill' },
        { label: 'Connected Calls', value: 6718, icon: 'checkmark.circle.fill' },
        { label: 'Missed Calls', value: 2238, icon: 'phone.arrow.up.right.fill' },
        { label: 'Visits Done', value: 1842, icon: 'mappin.fill' },
        { label: 'Loans Converted', value: 612, icon: 'chart.line.uptrend.xyaxis.fill' },
        { label: 'Distance Traveled', value: '42,150 km', icon: 'location.fill' },
      ],
    };
    return dataByTimespan[timespan];
  };

  const getChartData = (timespan: TimeSpan) => {
    const chartDataByTimespan = {
      today: [
        { label: '12:00', calls: 2 },
        { label: '1:00', calls: 3 },
        { label: '2:00', calls: 1 },
        { label: '3:00', calls: 2 },
        { label: '4:00', calls: 4 },
      ],
      week: [
        { label: 'Mon', calls: 12 },
        { label: 'Tue', calls: 14 },
        { label: 'Wed', calls: 10 },
        { label: 'Thu', calls: 16 },
        { label: 'Fri', calls: 11 },
        { label: 'Sat', calls: 8 },
        { label: 'Sun', calls: 7 },
      ],
      month: [
        { label: 'Week 1', calls: 68 },
        { label: 'Week 2', calls: 74 },
        { label: 'Week 3', calls: 62 },
        { label: 'Week 4', calls: 82 },
      ],
      year: [
        { label: 'Jan', calls: 258 },
        { label: 'Feb', calls: 276 },
        { label: 'Mar', calls: 242 },
        { label: 'Apr', calls: 312 },
        { label: 'May', calls: 288 },
        { label: 'Jun', calls: 296 },
        { label: 'Jul', calls: 334 },
        { label: 'Aug', calls: 312 },
        { label: 'Sep', calls: 276 },
        { label: 'Oct', calls: 298 },
        { label: 'Nov', calls: 288 },
        { label: 'Dec', calls: 264 },
      ],
      all: [
        { label: 'Y1', calls: 2842 },
        { label: 'Y2', calls: 3124 },
        { label: 'Y3', calls: 2990 },
      ],
    };
    return chartDataByTimespan[timespan];
  };

  const statistics = getStatistics(selectedTimespan);
  const chartData = getChartData(selectedTimespan);
  const maxCalls = Math.max(...chartData.map((d) => d.calls), 1);

  const timespanOptions: { value: TimeSpan; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getPerformanceMetric = (metric: string) => {
    const metrics: Record<string, Record<TimeSpan, string>> = {
      connectionRate: {
        today: '67%',
        week: '76%',
        month: '75%',
        year: '75%',
        all: '75%',
      },
      conversionRate: {
        today: '8%',
        week: '6%',
        month: '6%',
        year: '7%',
        all: '7%',
      },
      avgCallsPerVisit: {
        today: '4.0',
        week: '4.9',
        month: '5.5',
        year: '5.3',
        all: '4.9',
      },
      efficiencyScore: {
        today: '82%',
        week: '84%',
        month: '87%',
        year: '85%',
        all: '86%',
      },
    };
    return metrics[metric]?.[selectedTimespan] || '0%';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F0F4FF' }]} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color="#1E3A5F" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          Statistics
        </ThemedText>

        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{getInitials(salespersonName)}</Text>
        </View>
      </View>

      {/* Salesperson Name */}
      <View style={styles.nameContainer}>
        <ThemedText type="defaultSemiBold" style={styles.salespersonName}>
          {salespersonName}
        </ThemedText>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Timespan Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timespanContainer}
          contentContainerStyle={styles.timespanContent}>
          {timespanOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timespanButton,
                selectedTimespan === option.value && styles.timespanButtonActive,
              ]}
              onPress={() => setSelectedTimespan(option.value)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.timespanText,
                  selectedTimespan === option.value && styles.timespanTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Statistics Cards Grid - 2 columns */}
        <View style={styles.statsGrid}>
          {statistics.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol name={stat.icon as any} size={24} color="#0a7ea4" />
              </View>
              <Text style={styles.statLabel} numberOfLines={2}>
                {stat.label}
              </Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Performance Chart Section */}
        <View style={styles.chartContainer}>
          <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
            Total Calls
          </ThemedText>

          {/* Bar Chart */}
          <View style={styles.chart}>
            {chartData.map((data, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${maxCalls > 0 ? (data.calls / maxCalls) * 100 : 0}%`,
                        minHeight: data.calls > 0 ? 20 : 2,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.label}</Text>
                <Text style={styles.barValue}>{data.calls}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics Summary */}
        <View style={styles.metricsContainer}>
          <ThemedText type="defaultSemiBold" style={styles.metricsTitle}>
            Performance Metrics
          </ThemedText>
          <View style={styles.metricsList}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Connection Rate</Text>
              <Text style={styles.metricValue}>
                {getPerformanceMetric('connectionRate')}
              </Text>
            </View>
            <View style={[styles.metricItem, styles.metricItemBorder]}>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
              <Text style={styles.metricValue}>
                {getPerformanceMetric('conversionRate')}
              </Text>
            </View>
            <View style={[styles.metricItem, styles.metricItemBorder]}>
              <Text style={styles.metricLabel}>Avg Calls per Visit</Text>
              <Text style={styles.metricValue}>
                {getPerformanceMetric('avgCallsPerVisit')}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Efficiency Score</Text>
              <Text style={styles.metricValue}>
                {getPerformanceMetric('efficiencyScore')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nameContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  salespersonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  timespanContainer: {
    marginBottom: 24,
  },
  timespanContent: {
    gap: 8,
    paddingRight: 16,
  },
  timespanButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timespanButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  timespanText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A5F',
  },
  timespanTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#9BA1A6',
    marginBottom: 4,
    minHeight: 32,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 24,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 192,
    gap: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A5F',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    color: '#9BA1A6',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 16,
  },
  metricsList: {
    gap: 0,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  metricLabel: {
    fontSize: 16,
    color: '#1E3A5F',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
});

