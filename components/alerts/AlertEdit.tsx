import { GetAlert } from "@/services/alerts";
import { AlertListItem } from "@/types/Alert";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AlertEdit = ({ id }: { id: string }) => {
    const [alert, setAlert] = useState<AlertListItem>();
    const [selected, setSelected] = useState<string | null>(null);

    async function fetchAlert() {
        const result = await GetAlert(Number(id));

        if (result.has_error && result.error_code === "PERMISSION_DENIED") {
            Alert.alert("Alert", "Permission Denied");
        }

        if (result.has_error) {
            Alert.alert("Alert", result.message);
        }

        if (result.has_error && result.message === "Invalid or expired session") {
            Alert.alert("Session Over", "", [
                {
                    text: "OK",
                    onPress: () => router.push("/(auth)/sign-in"),
                },
            ]);
            return;
        }

        if (!result.has_error) {
            setAlert(result?.alert);
            setSelected(String(result?.alert?.status));
        }
    }

    async function updateAlert() {
        const data = {
            alert_id: Number(id),
            status: Number(selected),
            asset_status: null,
        };
        console.log("alert update data: ", JSON.stringify(data, null, 2));
        Alert.alert("Alert", "Alert updated succesfully");

        // const result = await UpdateAlert(data);

        // if (result.has_error && result.error_code === "PERMISSION_DENIED") {
        //     Alert.alert("Alert", "Permission Denied");
        // }

        // if (result.has_error) {
        //     Alert.alert("Alert", result.message);
        // }

        // if (result.has_error && result.message === "Invalid or expired session") {
        //     Alert.alert("Session Over", "", [
        //         {
        //             text: "OK",
        //             onPress: () => router.push("/(auth)/sign-in"),
        //         },
        //     ]);
        //     return;
        // }

        // if (!result.has_error) {
        //     Alert.alert("Alert", "Alert updated succesfully");
        // }
    }

    useEffect(() => {
        fetchAlert();
    }, []);

    const options = [
        { label: "In Workshop", value: "1" },
        { label: "Fixed", value: "2" },
        { label: "Not Repairable", value: "0" },
    ];

    return (
        <View className='flex-1 p-4 gap-3 mt-3'>
            <Text className='text-2xl text-center font-bold'>Repair Details</Text>
            <View className='flex-col gap-3 border-0 rounded-2xl p-4 bg-white'>
                <View>
                    <Text className=' text-lg'>
                        Asset Name: <Text className='text-black text-lg font-semibold'>{alert?.asset.name}</Text>
                    </Text>
                    <Text className=' text-lg'>
                        Asset Number: <Text className='text-black text-lg font-semibold'>{alert?.asset.name}</Text>
                    </Text>
                    <Text className=' text-lg'>
                        Asset Location:{" "}
                        <Text className='text-black text-lg font-semibold'>
                            {alert?.asset?.location?.location_name}
                        </Text>
                    </Text>
                    <Text className='text-lg'>
                        Created At: <Text className='text-black text-lg font-semibold'>{alert?.created_at}</Text>
                    </Text>
                </View>
                <View className='checkboxes'>
                    {/* <RadioGroup options={options} value={selected} onChange={(val) => setSelected(val)} /> */}
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={styles.container}
                            onPress={() => setSelected(opt.value)}>
                            <View style={[styles.outerCircle, selected === opt.value && styles.selectedOuter]}>
                                {selected === opt.value && <Ionicons name='checkmark' size={14} color='#fff' />}
                            </View>
                            <Text className='text-lg'>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View>
                    <TouchableOpacity
                        className='bg-[#263f94] rounded-2xl p-2 mt-6 active:opacity-80'
                        onPress={updateAlert}>
                        <Text className='text-white text-center font-semibold text-xl'>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default AlertEdit;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    // outerCircle: {
    //     height: 20,
    //     width: 20,
    //     // borderRadius: 10,
    //     borderWidth: 2,
    //     borderColor: "#333",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     marginRight: 8,
    // },
    outerCircle: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#263f94",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },

    selectedOuter: {
        backgroundColor: "#263f94",
    },
    checkIcon: {
        color: "#263f94",
        fontSize: 14,
        fontWeight: "bold",
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "#333",
    },
});
