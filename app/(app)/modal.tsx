import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-end bg-black/40">
      <View className="bg-white rounded-t-3xl p-5">
        <Text className="text-lg font-bold mb-4">My Modal</Text>

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}