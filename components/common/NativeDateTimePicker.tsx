import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

// ─── Props ───────────────────────────────────────────────────────────────────

interface DatePickerInputProps {
    /** Optional label rendered above the input field */
    label?: string;
    /** Controlled selected date; pass `null` when nothing is selected yet */
    value: Date | null;
    /** Callback fired with the confirmed Date */
    onChange: (date: Date) => void;
    /** Earliest selectable date */
    minimumDate?: Date;
    /** Latest selectable date */
    maximumDate?: Date;
    /** Overrides the default "dd/mm/yyyy" placeholder text */
    placeholder?: string;
    /** Extra styles applied to the outermost wrapper */
    style?: ViewStyle;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const formatDate = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

const NativeDateTimePicker: React.FC<DatePickerInputProps> = ({
    label,
    value,
    onChange,
    minimumDate,
    maximumDate,
    placeholder = "dd/mm/yyyy",
    style,
}) => {
    const [show, setShow] = useState<boolean>(false);
    const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

    const displayValue: string | null = value ? formatDate(value) : null;

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const handleOpen = (): void => {
        setTempDate(value ?? new Date());
        setShow(true);
    };

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
        if (Platform.OS === "android") {
            setShow(false);
            if (event.type === "set" && selectedDate) {
                onChange(selectedDate);
            }
        } else {
            // iOS: spinner stays open while scrolling
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleIOSDone = (): void => {
        setShow(false);
        onChange(tempDate);
    };

    const handleIOSCancel = (): void => {
        setShow(false);
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <View style={[styles.wrapper, style]}>
            {/* {!!label && <Text style={styles.label}>{label}</Text>} */}

            <TouchableOpacity
                activeOpacity={0.7}
                // style={[styles.inputBox, show && styles.inputBoxFocused]}
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-gray-800"
                onPress={handleOpen}
                accessibilityRole='button'
                accessibilityLabel={label ?? "Date picker"}
                accessibilityHint='Opens a date selector'>

                {/* <Text style={[styles.inputText, !displayValue && styles.placeholder]}> */}
                <Text className="">
                    {displayValue ?? placeholder}
                </Text>

            </TouchableOpacity>

            {/* ── Android: native bottom-sheet picker ── */}
            {Platform.OS === "android" && show && (
                <DateTimePicker
                    mode='date'
                    display='spinner'
                    value={tempDate}
                    onChange={handleChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}

            {/* ── iOS: inline spinner with toolbar ── */}
            {Platform.OS === "ios" && show && (
                <View style={styles.iosPickerContainer}>
                    <View style={styles.iosToolbar}>
                        <TouchableOpacity onPress={handleIOSCancel} style={styles.iosBtn}>
                            <Text style={styles.iosBtnTextCancel}>Cancel</Text>
                        </TouchableOpacity>

                        <Text style={styles.iosToolbarTitle}>Select Date</Text>

                        <TouchableOpacity onPress={handleIOSDone} style={styles.iosBtn}>
                            <Text style={styles.iosBtnTextDone}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <DateTimePicker
                        mode='date'
                        display='spinner'
                        value={tempDate}
                        onChange={handleChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        style={styles.iosPicker}
                    />
                </View>
            )}
        </View>
    );
};

export default NativeDateTimePicker;

// ─── Styles ──────────────────────────────────────────────────────────────────

const BRAND = "#4F6EF7";
const SURFACE = "#F7F8FC";
const BORDER = "#DDE1EE";
const TEXT = "#1A1D2E";
const MUTED = "#9EA5C0";

const styles = StyleSheet.create({
    wrapper: {
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: TEXT,
        letterSpacing: 0.3,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 10,
    },
    inputBoxFocused: {
        borderColor: BRAND,
        shadowColor: BRAND,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    icon: {
        fontSize: 18,
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
        color: TEXT,
        letterSpacing: 0.5,
    },
    placeholder: {
        color: MUTED,
        fontWeight: "400",
        letterSpacing: 1.2,
    },
    chevron: {
        fontSize: 22,
        color: MUTED,
        transform: [{ rotate: "90deg" }],
        lineHeight: 24,
    },
    chevronUp: {
        transform: [{ rotate: "-90deg" }],
        color: BRAND,
    },

    // iOS
    iosPickerContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: "hidden",
        marginTop: 8,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    iosToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        backgroundColor: SURFACE,
    },
    iosToolbarTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: TEXT,
    },
    iosBtn: {
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    iosBtnTextCancel: {
        fontSize: 15,
        color: MUTED,
        fontWeight: "500",
    },
    iosBtnTextDone: {
        fontSize: 15,
        color: BRAND,
        fontWeight: "700",
    },
    iosPicker: {
        height: 200,
    },
});

// ─── Usage Example ───────────────────────────────────────────────────────────
//
// import React, { useState } from 'react';
// import { View, StyleSheet } from 'react-native';
// import DatePickerInput from './DatePickerInput';
//
// export default function App(): React.JSX.Element {
//   const [dob, setDob] = useState<Date | null>(null);
//
//   return (
//     <View style={styles.container}>
//       <DatePickerInput
//         label="Date of Birth"
//         value={dob}
//         onChange={(date: Date) => setDob(date)}
//         maximumDate={new Date()}
//       />
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
// });
