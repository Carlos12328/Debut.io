import React from 'react';
import { View, Platform, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  backgroundColor?: string;
}

export function SafeScreen({ children, backgroundColor = '#fff' }: Props) {
  const insets = useSafeAreaInsets();
  const topoSeguro = Platform.OS === 'ios'
    ? Math.max(insets.top, 59)
    : (StatusBar.currentHeight ?? 24);

  return (
    <View style={[styles.container, { paddingTop: topoSeguro, backgroundColor }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});