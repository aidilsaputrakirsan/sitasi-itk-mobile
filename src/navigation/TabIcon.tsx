import React from 'react';
import type { LucideIcon } from 'lucide-react-native';

/**
 * Wrapper konsisten untuk icon bottom-tab menggunakan Lucide.
 * Pakai stroke-based icons untuk feel modern/minimal.
 */
export function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
}) {
  return <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />;
}
