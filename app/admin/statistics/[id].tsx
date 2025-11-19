import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { CallLog, getCallLogs, getStatistics, Statistics } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TimeSpan = 'today' | 'week' | 'month' | 'year' | 'all';

interface StatisticCard {
  label: string;
  value: string | number;
  icon: string;
}

interface ChartPoint {
  label: string;
  calls: number;
}

function buildChartData(timespan: TimeSpan, callLogs: CallLog[]): ChartPoint[] {
  if (!callLogs.length) return [];

  const now = new Date();

  if (timespan === 'today') {
    const byHour = new Map<string, number>();
    callLogs.forEach((log) => {
      const date = new Date(log.calledTime);
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      ) {
        const hour = date.getHours();
        const label = `${hour.toString().padStart(2, '0')}:00`;
        byHour.set(label, (byHour.get(label) || 0) + 1);
      }
    });
    return Array.from(byHour.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([label, calls]) => ({ label, calls }));
  }

  if (timespan === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay = new Map<number, number>();

    callLogs.forEach((log) => {
      const date = new Date(log.calledTime);
      if (date >= start && date <= now) {
        const dayIndex = date.getDay();
        byDay.set(dayIndex, (byDay.get(dayIndex) || 0) + 1);
      }
    });

    return weekdayLabels.map((label, index) => ({
      label,
      calls: byDay.get(index) || 0,
    }));
  }

  if (timespan === 'month') {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    const byWeek = new Map<number, number>();

    callLogs.forEach((log) => {
      const date = new Date(log.calledTime);
      if (date >= start && date <= now) {
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        byWeek.set(weekIndex, (byWeek.get(weekIndex) || 0) + 1);
      }
    });

    const labels = ['Week 4', 'Week 3', 'Week 2', 'Week 1'];
    return labels.map((label, idx) => {
      const weekIndexFromNow = 3 - idx;
      return {
        label,
        calls: byWeek.get(weekIndexFromNow) || 0,
      };
    });
  }

  if (timespan === 'year') {
    const start = new Date(now);
    start.setFullYear(now.getFullYear() - 1);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth = new Map<number, number>();

    callLogs.forEach((log) => {
      const date = new Date(log.calledTime);
      if (date >= start && date <= now) {
        const monthIndex = date.getMonth();
        byMonth.set(monthIndex, (byMonth.get(monthIndex) || 0) + 1);
      }
    });

    return monthLabels.map((label, index) => ({
      label,
      calls: byMonth.get(index) || 0,
    }));
  }

  // 'all' timespan – group by year
  const byYear = new Map<number, number>();
  callLogs.forEach((log) => {
    const date = new Date(log.calledTime);
    const year = date.getFullYear();
    byYear.set(year, (byYear.get(year) || 0) + 1);
  });

  return Array.from(byYear.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, calls]) => ({
      label: `Y${year.toString().slice(-2)}`,
      calls,
    }));
}

export default function SalespersonStatisticsPage() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { token } = useAuth();
  const salespersonName = name || 'Salesperson';
  const [selectedTimespan, setSelectedTimespan] = useState<TimeSpan>('month');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) {
      setIsLoading(false);
      setErrorMessage('Missing authentication or salesperson id.');
      return;
    }

    let isCancelled = false;

    async function loadData() {
      try {
        const [statsResponse, callLogsResponse] = await Promise.all([
          getStatistics(id as string, token as string),
          getCallLogs(id as string, token as string),
        ]);

        if (isCancelled) return;
        setStatistics(statsResponse as Statistics);
        setCallLogs(callLogsResponse as CallLog[]);
      } catch (error) {
        console.error('Error loading salesperson statistics:', error);
        if (!isCancelled) {
          setErrorMessage('Failed to load statistics. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [id, token]);

  const safeStatistics: Statistics = statistics || {
    totalCalls: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    totalMeets: 0,
  };

  const statisticCards: StatisticCard[] = [
    { label: 'Total Calls', value: safeStatistics.totalCalls, icon: 'phone.fill' },
    { label: 'Total Meets', value: safeStatistics.totalMeets ?? 0, icon: 'mappin.fill' },
    { label: 'Hot Leads', value: safeStatistics.hotLeads, icon: 'flame.fill' },
    { label: 'Warm Leads', value: safeStatistics.warmLeads, icon: 'sun.max.fill' },
    { label: 'Cold Leads', value: safeStatistics.coldLeads, icon: 'snowflake' },
    {
      label: 'Total Leads',
      value:
        (safeStatistics.hotLeads || 0) +
        (safeStatistics.warmLeads || 0) +
        (safeStatistics.coldLeads || 0),
      icon: 'chart.bar.fill',
    },
  ];

  const chartData = buildChartData(selectedTimespan, callLogs);
  const maxCalls = chartData.length ? Math.max(...chartData.map((d) => d.calls), 1) : 1;

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
    const totalLeads =
      (safeStatistics.hotLeads || 0) +
      (safeStatistics.warmLeads || 0) +
      (safeStatistics.coldLeads || 0);

    const totalCallsMade = callLogs.length || safeStatistics.totalCalls || 0;
    const connectedCalls = callLogs.filter(
      (log) => log.status.toLowerCase() === 'connected'
    ).length;

    const connectionRate =
      totalCallsMade > 0 ? (connectedCalls / totalCallsMade) * 100 : 0;

    const conversionRate =
      totalLeads > 0 ? (safeStatistics.hotLeads / totalLeads) * 100 : 0;

    const totalMeets = safeStatistics.totalMeets ?? 0;
    const avgCallsPerVisit =
      totalMeets > 0 ? safeStatistics.totalCalls / totalMeets : 0;

    // Simple combined efficiency score based on connection and conversion rates
    const efficiencyScore =
      connectionRate === 0 && conversionRate === 0
        ? 0
        : connectionRate * 0.6 + conversionRate * 0.4;

    const formatPercent = (value: number, fractionDigits = 0) =>
      `${value.toFixed(fractionDigits)}%`;

    switch (metric) {
      case 'connectionRate':
        return formatPercent(connectionRate, 0);
      case 'conversionRate':
        return formatPercent(conversionRate, 0);
      case 'avgCallsPerVisit':
        return avgCallsPerVisit.toFixed(1);
      case 'efficiencyScore':
        return formatPercent(efficiencyScore, 0);
      default:
        return '0';
    }
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
          {statisticCards.map((stat, index) => (
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
            {chartData.length > 0 ? (
              chartData.map((data, index) => {
                const relativeHeight = maxCalls > 0 ? (data.calls / maxCalls) * 160 : 0;
                const barHeight = Math.max(relativeHeight, data.calls > 0 ? 20 : 2);

                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{data.label}</Text>
                    <Text style={styles.barValue}>{data.calls}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.barContainer}>
                <Text style={styles.barLabel}>No call data</Text>
              </View>
            )}
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
    height: '80%',
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
    fontSize: 9,
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

