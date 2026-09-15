import { Stack } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { CircleUserRound } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={(props) => ({
          title: 'Bytebank',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
              onPress={() => props.navigation.navigate('profile')}
              style={({ pressed }) => [
                styles.profileButton,
                pressed && styles.profileButtonPressed,
              ]}>
              <CircleUserRound size={28} accessible={false} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="transactionAdd" options={{ title: 'Adicionar Transação' }} />
      <Stack.Screen name="transactionDetails" options={{ title: 'Detalhes da Transação' }} />
      <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonPressed: {
    opacity: 0.65,
  },
});
