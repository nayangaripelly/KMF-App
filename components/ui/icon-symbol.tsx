// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IconMapping = Partial<Record<SymbolViewProps['name'], MaterialIconName>>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bell.fill': 'notifications',
  'magnifyingglass': 'search',
  'phone.fill': 'phone',
  phone: 'phone',
  'phone.arrow.up.right.fill': 'call-made',
  'phone.down.fill': 'call-end',
  'location.fill': 'location-on',
  'mappin.fill': 'place',
  'flame.fill': 'whatshot',
  'sun.max.fill': 'wb-sunny',
  snowflake: 'ac-unit',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'bar-chart',
  'chart.line.uptrend.xyaxis.fill': 'show-chart',
  'chart.line.uptrend.xyaxis': 'show-chart',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.circle': 'check-circle-outline',
  plus: 'add',
  xmark: 'close',
  'chevron.left': 'chevron-left',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const fallbackIcon: MaterialIconName = 'help-outline';
  const materialIconName = MAPPING[name] ?? fallbackIcon;

  return <MaterialIcons color={color} size={size} name={materialIconName} style={style} />;
}
