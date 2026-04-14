import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppBottomSheet = forwardRef((props: any, ref: any) => {
  const snapPoints = useMemo(() => ["40%"], []); // single height
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false} // ❌ disable drag close
      enableHandlePanningGesture={false} // ❌ disable dragging
      enableContentPanningGesture={false} // ❌ disable dragging
      handleComponent={null} // ❌ remove top bar
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close" // ✅ click outside closes
        />
      )}
      
      bottomInset={insets.bottom + 50}
    >
      <BottomSheetView style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Bottom Sheet Content
        </Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default AppBottomSheet;