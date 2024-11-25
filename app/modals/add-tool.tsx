import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { toolService } from "../services/api";

export default function AddToolModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [toolData, setToolData] = useState({
    nfcId: "",
    name: "",
    image: "default.jpg",
    price: "",
  });

  useEffect(() => {
    // Pre-fill the NFC ID if it comes from scanning
    if (params.nfcId) {
      setToolData((prev) => ({
        ...prev,
        nfcId: params.nfcId as string,
      }));
    }
  }, [params.nfcId]);

  const handleSubmit = async () => {
    if (!toolData.nfcId || !toolData.name || !toolData.price) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    try {
      await toolService.addTool({
        ...toolData,
        price: Number(toolData.price),
      });
      Alert.alert("Success", "Tool added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add tool. Please try again.");
      console.error("Error adding tool:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {params.fromScan === "1" ? "New Tool Scanned" : "Add New Tool"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {params.fromScan === "1" && (
        <View style={styles.scanNote}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.scanNoteText}>
            New NFC tag detected. Please complete the tool details.
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NFC ID</Text>
          <TextInput
            style={[styles.input, params.nfcId && styles.disabledInput]}
            value={toolData.nfcId}
            onChangeText={(text) =>
              setToolData((prev) => ({ ...prev, nfcId: text }))
            }
            placeholder="Enter NFC ID"
            editable={!params.nfcId}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tool Name</Text>
          <TextInput
            style={styles.input}
            value={toolData.name}
            onChangeText={(text) =>
              setToolData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter tool name"
            autoFocus={!!params.fromScan}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Daily Rental Price ($)</Text>
          <TextInput
            style={styles.input}
            value={toolData.price}
            onChangeText={(text) =>
              setToolData((prev) => ({ ...prev, price: text }))
            }
            placeholder="Enter price"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Tool</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scanNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E3F2FD",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  scanNoteText: {
    marginLeft: 8,
    color: "#0D47A1",
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
