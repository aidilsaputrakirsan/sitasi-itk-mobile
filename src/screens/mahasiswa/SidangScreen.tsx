import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { RegistrationInfo } from '../../components/ui/RegistrationInfo';
import {
  AnimatedHeader,
  useCollapsibleHeader,
} from '../../components/ui/AnimatedHeader';
import { palette } from '../../theme';

export function SidangScreen() {
  const { scrollY, scrollProps, contentContainerPaddingTop } =
    useCollapsibleHeader();

  return (
    <View style={styles.root}>
      <AnimatedHeader
        title="Sidang TA"
        subtitle="Registrasi & status sidang"
        scrollY={scrollY}
      />
      <Animated.ScrollView
        {...scrollProps}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: contentContainerPaddingTop },
        ]}
      >
        <RegistrationInfo type="sidang" />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  scroll: { paddingBottom: 32 },
});
