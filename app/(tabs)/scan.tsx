import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { toolService } from "../services/api";

export default function ScanScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const simulateSuccessfulScan = async () => {
    setIsScanning(true);
    try {
      const response = await toolService.scanTool("NFC002");
      if (response) {
        router.push({
          pathname: "/modals/select-user",
          params: {
            toolId: response.nfcId || "NFC002", // Add fallback
            toolName: response.name,
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to scan tool");
      console.error("Scan error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const simulateNewToolScan = async () => {
    setIsScanning(true);
    try {
      const response = await toolService.scanTool("NFC004");
      console.log("New tool scan response:", response);
      router.push({
        pathname: "/modals/add-tool",
        params: {
          nfcId: "NFC004",
          fromScan: "1",
        },
      });
    } catch (error: any) {
      console.log("Error response:", error.response);
      if (error.response?.status === 404) {
        router.push({
          pathname: "/modals/add-tool",
          params: {
            nfcId: "NFC004",
            fromScan: "1",
          },
        });
      } else {
        Alert.alert("Error", "Failed to check tool");
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scanArea}>
        {isScanning ? (
          <View style={styles.scanningContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.scanningText}>Scanning...</Text>
          </View>
        ) : (
          <>
            <Ionicons name="scan-circle-outline" size={120} color="red" />
            <Text style={styles.instructions}>SCAN ME</Text>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={simulateSuccessfulScan}
          disabled={isScanning}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={24}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Simulate Finding NFC001</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.newToolButton]}
          onPress={simulateNewToolScan}
          disabled={isScanning}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Simulate New Tool (NFC004)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scanningContainer: {
    alignItems: "center",
  },
  scanningText: {
    marginTop: 20,
    fontSize: 18,
    color: "#007AFF",
  },
  instructions: {
    marginTop: 20,
    fontSize: 25,
    color: "#000",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  newToolButton: {
    backgroundColor: "red",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
