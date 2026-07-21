import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { CircleUserRound } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={(props) => ({ 
          title: 'Bytebank', 
          headerRight: () => //trocar para botão padrão do app
            <TouchableOpacity className="p-2" onPress={() => props.navigation.navigate('profile')}>
              <CircleUserRound size={28} />
            </TouchableOpacity>
        })} 
      />
      <Stack.Screen name="transactionAdd" options={{ title: 'Adicionar Transação' }} />
      <Stack.Screen name="transactionDetails" options={{ title: 'Detalhes da Transação' }} />
      <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
    </Stack>
  )
}