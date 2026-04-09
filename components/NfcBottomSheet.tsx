import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

// ✅ 1. Define navigation types
type RootStackParamList = {
  AssetDetails: { uid: string };
};

// ✅ 2. Define props type
type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
};

export default function NfcBottomSheet({ open, setOpen }: Props) {
  // ✅ 3. Proper ref typing
  const sheetRef = useRef<BottomSheetModal>(null);

  // ✅ 4. Typed navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const snapPoints = useMemo(() => ["45%"], []);

  // ✅ 5. Strongly typed tab
  const [tab, setTab] = useState<"nfc" | "scan" | "search">("nfc");
  const [uid, setUid] = useState<string>("");

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [open]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      onDismiss={() => setOpen(false)}
    >
      <View style={{ padding: 16 }}>
        
        {/* Tabs */}
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {(["nfc", "scan", "search"] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}>
              <Text style={{ color: tab === t ? "#1e3a8a" : "#999" }}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ marginTop: 20 }}>
          {tab === "search" && (
            <>
              <TextInput
                value={uid}
                onChangeText={setUid}
                placeholder="Enter UID"
                style={{
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 10,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  if (!uid) return;
                  sheetRef.current?.dismiss();
                  navigation.navigate("AssetDetails", { uid });
                }}
                style={{
                  backgroundColor: "#1e3a8a",
                  padding: 14,
                  borderRadius: 20,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </BottomSheetModal>
  );
}