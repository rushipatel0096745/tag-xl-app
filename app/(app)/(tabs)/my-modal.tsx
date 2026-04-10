import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function MyModal() {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)", // overlay background
                justifyContent: "center",
                alignItems: "center",
            }}>
            <View
                style={{
                    width: "80%",
                    backgroundColor: "white",
                    padding: 20,
                    borderRadius: 16,
                }}>
                <Text>Modal Content</Text>

                <Pressable onPress={() => router.back()}>
                    <Text style={{ marginTop: 10, color: "blue" }}>Close</Text>
                </Pressable>
            </View>
        </View>
    );
}
