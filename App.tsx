import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FAB, PaperProvider, Portal } from "react-native-paper";

import GyroscopeTab from "./components/GyroscopeTab";

export default function App() {
  const [selectedFunction, setSelectedFunction] = useState("paused");
  const [FABOpen, setFABOpen] = useState(false);
  const [previousFunction, setPreviousFunction] = useState(null);

  const renderFunction = () => {
    switch (selectedFunction) {
      case "gyroscope":
        return <GyroscopeTab />;
      default:
        return (
          <View>
            <Text>Paused</Text>
          </View>
        );
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>{renderFunction()}</View>
      <StatusBar style="auto" />
      <Portal>
        <FAB.Group
          open={FABOpen}
          visible
          icon={FABOpen ? "calendar-today" : "plus"}
          actions={[
            {
              icon: "scale-balance",
              label: "Gyroscope",
              onPress: () => {
                setSelectedFunction("gyroscope");
                setFABOpen(false);
              },
            },
          ]}
          onStateChange={() => console.log("state changed")}
          onPress={() => {
            if (FABOpen) {
              setFABOpen(false);
              if (previousFunction) {
                setSelectedFunction(previousFunction);
              }
            } else {
              setFABOpen(true);
              setPreviousFunction(selectedFunction);
              setSelectedFunction("paused");
            }
          }}
        />
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    margin: 32,
    right: 0,
    bottom: 0,
  },
});
