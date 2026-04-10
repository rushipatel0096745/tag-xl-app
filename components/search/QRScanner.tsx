import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function QRScanner({ onScan }: { onScan: (uid: string) => void }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState<FlashMode>("off");

    if (!permission) return <Text>Loading...</Text>;

    if (!permission.granted) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Text>We need camera permission</Text>
                <Text onPress={requestPermission}>Grant Permission</Text>
            </View>
        );
    }

    const handleScan = ({ data }: { data: string }) => {
        if (scanned) return;

        let parsedData: { uid?: string };
        try {
            parsedData = JSON.parse(data);
        } catch {
            Alert.alert("Invalid QR", "Could not parse QR code data.");
            return;
        }

        if (!parsedData.uid) {
            Alert.alert("Invalid QR", "UID not found in QR code.");
            return;
        }

        setScanned(true);
        onScan(parsedData.uid); 
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
                flash={flash}
            />

            <View className='absolute inset-0'>
                <BlurView intensity={60} className='absolute top-0 left-0 right-0 h-[25%]' />
                <BlurView intensity={60} className='absolute bottom-0 left-0 right-0 h-[25%]' />
                <BlurView intensity={60} className='absolute top-[25%] bottom-[25%] left-0 w-[15%]' />
                <BlurView intensity={60} className='absolute top-[25%] bottom-[25%] right-0 w-[15%]' />

                <View className='absolute inset-0 justify-center items-center'>
                    <View className='w-64 h-64'>
                        <View className='absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-white rounded-tl-xl' />
                        <View className='absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-white rounded-tr-xl' />
                        <View className='absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-white rounded-bl-xl' />
                        <View className='absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-white rounded-br-xl' />
                    </View>

                    <Text className='text-white mt-6 text-center text-base'>
                        {scanned ? "Redirecting..." : "Scan QR code"}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleFlash}
                className='absolute top-20 right-6 bg-black/40 p-3 rounded-full'
            >
                <Ionicons name={flash === "off" ? "flash-off" : "flash"} size={22} color='white' />
            </TouchableOpacity>
        </View>
    );
}