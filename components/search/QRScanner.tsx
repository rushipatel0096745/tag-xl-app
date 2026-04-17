import { Ionicons } from "@expo/vector-icons";
import { CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type Props = { onScan: (uid: string, resetScanner: () => void) => void };

const BOX_SIZE = 260;

export default function QRScanner({ onScan }: Props) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState<FlashMode>("off");

    useFocusEffect(
        useCallback(() => {
            setScanned(false);
        }, [])
    );

    const resetScanner = () => {
        setScanned(false);
    };

    if (!permission?.granted) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Text>We need camera permission</Text>
                <Text onPress={requestPermission}>Grant Permission</Text>
            </View>
        );
    }

    const handleScan = ({ data }: { data: string }) => {
        if (scanned) return;

        // let parsedData: { uid?: string };
        let parsedData: any;
        try {
            // parsedData = JSON.parse(data);
            parsedData = data;
        } catch {
            Alert.alert("Invalid QR", "Could not parse QR code data.");
            router.replace("/(app)/(tabs)/home");
            return;
        }

        // if (!parsedData.uid) {
        //     Alert.alert("Invalid QR", "UID not found in QR code.");
        //     router.replace("/(app)/(tabs)/home");
        //     return;
        // }

        setScanned(true);

        setTimeout(() => {
            // onScan(data);
            onScan(data, resetScanner);
        }, 300);
    };

    const handleFlash = () => {
        setFlash((prev) => (prev === "off" ? "on" : "off"));
    };

    return (
        <View className='flex-1'>
            <CameraView
                style={{ flex: 1 }}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleScan}
                enableTorch={flash === "on"}
            />

            <View className='absolute inset-0'>
                <View className='bg-[rgba(0,0,0,0.6)] flex-1 w-full' />

                <View className='flex-row w-full' style={{ height: BOX_SIZE }}>
                    <View className='bg-[rgba(0,0,0,0.6)] flex-1 h-full' />

                    <View style={{ width: BOX_SIZE, height: BOX_SIZE }}>
                        <View className='absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-white rounded-tl-xl' />
                        <View className='absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-white rounded-tr-xl' />
                        <View className='absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-white rounded-bl-xl' />
                        <View className='absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-white rounded-br-xl' />
                    </View>

                    <View className='bg-[rgba(0,0,0,0.6)] flex-1 h-full' />
                </View>

                <View className='bg-[rgba(0,0,0,0.6)] flex-1 w-full items-center pt-8'>
                    <Text className='text-white text-center text-base'>
                        {scanned ? "Redirecting..." : "Scan QR code"}
                    </Text>
                </View>
            </View>

            <TouchableOpacity onPress={handleFlash} className='absolute top-20 right-6 bg-black/40 p-3 rounded-full'>
                <Ionicons name={flash === "off" ? "flash-off" : "flash"} size={22} color='white' />
            </TouchableOpacity>
        </View>
    );
}
