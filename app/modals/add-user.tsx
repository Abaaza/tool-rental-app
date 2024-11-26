import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "../services/api";

type UserData = {
  name: string;
  companyName: string;
  role: "admin" | "customer";
};

export default function AddUserModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    companyName: "",
    role: "customer",
  });

  const handleSubmit = async () => {
    // Validate inputs
    if (!userData.name.trim() || !userData.companyName.trim()) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userService.addUser(userData);
      Alert.alert("Success", "User added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      setError(error.message);
      Alert.alert(
        "Error",
        error.message || "Failed to add user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New User</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter user's full name"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={userData.companyName}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, companyName: text }))
              }
              placeholder="Enter company name"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.disabledButton,
              error && styles.errorButton,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add User</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
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
  errorText: {
    color: "#FF3B30",
    marginBottom: 10,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  errorButton: {
    backgroundColor: "#FF3B30",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
