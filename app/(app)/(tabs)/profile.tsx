import { useAuth } from "@/context/AuthContext";
import { Link } from "expo-router";
// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

function DateField() {
  const [date, setDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const formatDate = (d: Date | null) => {
    if (!d) return "dd/mm/yyyy";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View>
      {/* 👇 Clickable Input */}
      <TouchableOpacity
        onPress={() => {
          setTempDate(date || new Date());
          setShow(true);
        }}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text style={{ color: date ? "#000" : "#999" }}>
          {formatDate(date)}
        </Text>
      </TouchableOpacity>

      {/* 👇 Modal Date Picker */}
      <Modal visible={show} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "#222",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              Select Start Date
            </Text>

            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner" // 🔥 IMPORTANT
              onChange={(e, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
              themeVariant="dark"
            />

            {/* Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text
                onPress={() => setShow(false)}
                style={{ color: "#ccc", fontSize: 16 }}
              >
                Cancel
              </Text>

              <Text
                onPress={() => {
                  setDate(tempDate); // ✅ confirm selection
                  setShow(false);
                }}
                style={{ color: "#4da6ff", fontSize: 16 }}
              >
                OK
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Profile = () => {
    const { logOut } = useAuth();
    return (
        <View>
            <Text>Profile</Text>
            <TouchableOpacity className='bg-blue-600 rounded-xl p-2 mt-6 active:opacity-80' onPress={logOut}>
                <Text className='text-white text-center font-semibold text-lg'>Logout</Text>
            </TouchableOpacity>

            <Link href={"/(app)/(tabs)/profile"}>
                <Text>Go to asset</Text>
            </Link>

            {/* <DateField /> */}
        </View>
    );
};

export default Profile;
