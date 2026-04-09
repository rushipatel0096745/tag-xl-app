import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import RadioButton, { RadioSize } from "./RadioButton";

export interface RadioOption {
    label: string;
    sublabel?: string;
    value: string;
    disabled?: boolean;
    rightSlot?: React.ReactNode;
}

interface RadioGroupProps {
    options: RadioOption[];
    value: string | null;
    onChange: (value: string) => void;
    direction?: "vertical" | "horizontal";
    size?: RadioSize;
    error?: string; // error message string — presence triggers error state
    label?: string; // optional group heading
    style?: ViewStyle;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
    options,
    value,
    onChange,
    direction = "vertical",
    size = "md",
    error,
    label,
    style,
}) => {
    return (
        <View style={style}>
            {label ? <Text style={styles.groupLabel}>{label}</Text> : null}

            <View style={[styles.group, direction === "horizontal" && styles.horizontal]}>
                {options.map((opt) => (
                    <RadioButton
                        key={opt.value}
                        label={opt.label}
                        sublabel={opt.sublabel}
                        value={opt.value}
                        selected={value === opt.value}
                        onSelect={onChange}
                        disabled={opt.disabled}
                        error={!!error}
                        size={size}
                        rightSlot={opt.rightSlot}
                        style={direction === "horizontal" ? { flex: 1 } : undefined}
                    />
                ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    groupLabel: {
        fontSize: 13,
        fontWeight: "500",
        color: "#888780",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    group: {
        flexDirection: "column",
        gap: 8,
    },
    horizontal: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    errorText: {
        fontSize: 12,
        color: "#A32D2D",
        marginTop: 6,
    },
});

export default RadioGroup;
