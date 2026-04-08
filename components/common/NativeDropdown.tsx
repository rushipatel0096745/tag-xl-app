import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type Option = {
    label: string;
    value: string;
};

type Props = {
    value?: string | number;
    data: any;
    onChange?: (item: string) => void;
    labelField?: string;
    valueField?: string;
    placeholder?: string;
    readonly?: boolean;
};

const NativeDropdown = ({ value, data, onChange, labelField, valueField, placeholder }: Props) => {
    const [localValue, setLocalValue] = useState(value ?? "");

    const handleChange = (item: Option) => {
        setLocalValue(item.value);
        onChange?.(item.value);
    };

    return (
        <View style={styles.container}>
            <Dropdown
                style={styles.dropdown}
                selectedTextStyle={styles.selectedText}
                itemTextStyle={styles.itemText}
                data={data}
                labelField={labelField ?? "label"}
                valueField={valueField ?? "value"}
                value={value ?? localValue}
                onChange={handleChange}
                search={false}
                placeholder={placeholder}
            />
        </View>
    );
};

export default NativeDropdown;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: "center",
        width: "100%"
    },
    dropdown: {
        height: 48,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 14,
        backgroundColor: "#fff",
    },
    selectedText: {
        fontSize: 15,
        color: "#111",
    },
    itemText: {
        fontSize: 15,
        color: "#111",
    },
});
