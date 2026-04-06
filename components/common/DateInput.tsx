import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;   
  maximumDate?: Date;   
};

const DateInput = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
}: Props) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios"); // iOS stays open
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-gray-700">{label}</Text>
      )}

      {/* Touchable Input UI */}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="border border-gray-300 rounded-lg p-3 bg-white"
      >
        <Text className="text">
          {value
            ? value.toLocaleDateString()
            : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Native Picker */}
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default DateInput;