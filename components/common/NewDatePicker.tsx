// components/AppDatePicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

// Union of both platform types
// type PickerMode = IOSMode | AndroidMode;

interface AppDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: string; // 'date' | 'time' | 'datetime'
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  is24Hour?: boolean;
  disabled?: boolean;
  display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'inline';
}

export const AppDatePicker = ({
  value,
  onChange,
  mode = 'date',
  label,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  is24Hour = true,
  disabled = false,
  display,
}: AppDatePickerProps) => {
  const [show, setShow] = useState<boolean>(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDisplay = (date: Date) => {
    if (mode === 'time') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (mode === 'datetime') return date.toLocaleString();
    return date.toLocaleDateString();
  };

  return (
    <View className='gap-1'>
      {label && (
        <Text className='text-sm font-medium text-gray-700'>{label}</Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setShow(true)}
        className={`border rounded-xl px-4 py-3 flex-row justify-between items-center
          ${disabled ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-200'}`}
        activeOpacity={disabled ? 1 : 0.7}>
        <Text className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <Text className='text-gray-400'>📅</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode='date'     // ← platform-safe mode
          is24Hour={is24Hour}
          display={display ?? 'default'} // ← platform-safe display
          onChange={handleChange}
          design="material"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

export default AppDatePicker;