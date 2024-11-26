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
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill the NFC ID if it comes from scanning
    if (params.nfcId) {
      setToolData((prev) => ({
        ...prev,
        nfcId: params.nfcId as string,
      }));
    }
  }, [params.nfcId]);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry",
          "We need camera roll permissions to upload images."
        );
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setToolData((prev) => ({
          ...prev,
          image: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!toolData.nfcId || !toolData.name || !toolData.price) {
      Alert.alert("Error", "NFC ID, name and price are required");
      return;
    }

    setLoading(true);
    try {
      await toolService.addTool({
        ...toolData,
        price: Number(toolData.price),
        image: imageUri || "default.jpg", // Use default if no image selected
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tool Image (Optional)</Text>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.imagePickerButton}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={24} color="#666" />
                <Text style={styles.imagePlaceholderText}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity
              onPress={() => {
                setImageUri(null);
                setToolData((prev) => ({ ...prev, image: "default.jpg" }));
              }}
              style={styles.removeImageButton}
            >
              <Text style={styles.removeImageText}>Remove Image</Text>
            </TouchableOpacity>
          )}
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
  imagePickerButton: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  removeImageButton: {
    marginTop: 8,
    padding: 8,
    alignItems: "center",
  },
  removeImageText: {
    color: "#FF3B30",
    fontSize: 14,
  },
});
