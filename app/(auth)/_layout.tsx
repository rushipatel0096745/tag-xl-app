import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
    const { sessionId, isLoading } = useAuth();

    if (isLoading) return null;

    if (sessionId) {
        return <Redirect href={"/(app)/(tabs)/home"} />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
