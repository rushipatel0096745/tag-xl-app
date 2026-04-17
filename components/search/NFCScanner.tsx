import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

const NFCScanner = ({ onScan }: { onScan: (uid: string, reset: () => void) => void }) => {
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (!NfcManager) {
            console.log("NFC not available (probably emulator)");
            return;
        }
        const initNfc = async () => {
            try {
                await NfcManager.start();
            } catch (e) {
                console.log("NFC init error:", e);
            }
        };

        initNfc();

        return () => {
            NfcManager.cancelTechnologyRequest();
        };
    }, []);

    const resetScanner = () => {
        setScanning(false);
    };

    const handleScan = async () => {
        try {
            const isSupported = await NfcManager.isSupported();
            if (!isSupported) {
                Alert.alert("NFC not supported on this device");
                return;
            }

            const isEnabled = await NfcManager.isEnabled();
            if (!isEnabled) {
                Alert.alert("Please enable NFC in settings");
                return;
            }

            setScanning(true);

            await NfcManager.requestTechnology(NfcTech.NfcA, {
                alertMessage: "Hold your phone near the NFC tag",
            });

            const tag = await NfcManager.getTag();
            const uid = tag?.id;

            if (uid) {
                onScan(uid, resetScanner);
            } else {
                resetScanner();
            }
        } catch (e) {
            console.log("Scan error:", e);
            resetScanner();
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    };

    return (
        <View className='flex-1 justify-center items-center'>
            <View className='gap-2'>
                <Text className='text-2xl font-bold text-center'>NFC Reader</Text>
                <Text className='text-lg text-gray-800 text-center'>Press Scan NFC to get started</Text>
                <View className='items-center'>
                    <TouchableOpacity className='bg-[#263f94] rounded-xl py-3 px-4 items-center' onPress={handleScan}>
                        <Text className='text-white text-[14px] font-medium text-center'>
                            {scanning ? "Scanning..." : "Scan NFC"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default NFCScanner;
