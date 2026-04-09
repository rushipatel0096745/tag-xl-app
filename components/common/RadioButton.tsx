import React from "react";
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

export type RadioSize = "sm" | "md" | "lg";

interface RadioButtonProps {
    label: string;
    sublabel?: string;
    value: string;
    selected: boolean;
    onSelect: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
    size?: RadioSize;
    rightSlot?: React.ReactNode; // e.g. a badge, price tag, icon
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

const SIZE_MAP = {
    sm: { outer: 16, inner: 8, label: 13, padding: 8 },
    md: { outer: 20, inner: 10, label: 15, padding: 12 },
    lg: { outer: 24, inner: 12, label: 17, padding: 14 },
};

const COLORS = {
    primary: "#534AB7",
    error: "#E24B4A",
    selectedBg: "#EEEDFE",
    errorBg: "#FCEBEB",
    border: "#E2E0D8",
    borderHover: "#B4B2A9",
    disabled: 0.4,
};

const RadioButton: React.FC<RadioButtonProps> = ({
    label,
    sublabel,
    value,
    selected,
    onSelect,
    disabled = false,
    error = false,
    size = "md",
    rightSlot,
    style,
    labelStyle,
}) => {
    const s = SIZE_MAP[size];

    const borderColor = error ? COLORS.error : selected ? COLORS.primary : COLORS.border;

    const bgColor = error && selected ? COLORS.errorBg : selected ? COLORS.selectedBg : "transparent";

    const dotColor = error ? COLORS.error : COLORS.primary;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => !disabled && onSelect(value)}
            disabled={disabled}
            accessibilityRole='radio'
            accessibilityState={{ checked: selected, disabled }}
            accessibilityLabel={label}
            style={[
                styles.container,
                { borderColor, backgroundColor: bgColor, padding: s.padding, opacity: disabled ? COLORS.disabled : 1 },
                style,
            ]}>
            {/* Outer ring */}
            <View style={[styles.outerRing, { width: s.outer, height: s.outer, borderColor }]}>
                {selected && (
                    <View style={[styles.innerDot, { width: s.inner, height: s.inner, backgroundColor: dotColor }]} />
                )}
            </View>

            {/* Label area */}
            <View style={styles.labelContainer}>
                <Text style={[styles.label, { fontSize: s.label }, labelStyle]}>{label}</Text>
                {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
            </View>

            {/* Optional right slot (badge, price, icon) */}
            {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 0.5,
        borderRadius: 10,
        gap: 10,
    },
    outerRing: {
        borderRadius: 999,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    innerDot: {
        borderRadius: 999,
    },
    labelContainer: {
        flex: 1,
    },
    label: {
        color: "#1A1A1A",
        fontWeight: "400",
    },
    sublabel: {
        fontSize: 12,
        color: "#888780",
        marginTop: 2,
    },
    rightSlot: {
        marginLeft: "auto",
    },
});

export default RadioButton;
