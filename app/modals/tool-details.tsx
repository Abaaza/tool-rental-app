import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { toolService } from "../services/api";

type ToolData = {
  nfcId: string;
  name: string;
  image: string;
  price: number;
};

export default function ToolDetailsModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<ToolData | null>(null);

  useEffect(() => {
    loadToolData();
  }, [params.toolId]);

  const loadToolData = async () => {
    if (!params.toolId) {
      Alert.alert("Error", "No tool ID provided");
      return;
    }

    try {
      const data = await toolService.scanTool(params.toolId as string);
      setTool(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load tool details");
      console.error("Error loading tool:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!tool) return;

    console.log("Navigating to select user with tool:", tool);
    router.push({
      pathname: "/modals/select-user",
      params: {
        toolId: tool.nfcId, // Make sure we're passing nfcId
        toolName: tool.name, // Optional: pass tool name for reference
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tool details...</Text>
      </View>
    );
  }

  if (!tool) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tool not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tool Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.toolIcon}>
          <Ionicons name="build-outline" size={60} color="#007AFF" />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.toolName}>{tool.name}</Text>
          <Text style={styles.serialNumber}>NFC ID: {tool.nfcId}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Daily Rental Rate</Text>
            <Text style={styles.price}>${tool.price.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
          <Text style={styles.assignButtonText}>Assign Tool</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
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
  content: {
    padding: 20,
  },
  toolIcon: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  toolName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  serialNumber: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  assignButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  assignButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
