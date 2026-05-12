import { StyleSheet, Text, View } from 'react-native';

type AppViewProps = {
  message: string;
};

export function AppView({ message }: AppViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
