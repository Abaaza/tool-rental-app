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
import { userService, orderService } from "../services/api";
import { useAuth, User } from "../context/auth"; // Import User type from auth context

export default function SelectUserModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [duration, setDuration] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    try {
      console.log("Loading users...");
      const response = await userService.getAllUsers();
      console.log("All users:", response);

      // Filter out the admin user and include all others as customers
      const customers = response.filter(
        (user) =>
          user.role
            ? user.role === "customer" // If role exists, check if it's customer
            : user.name !== "Admin User" // If no role, include all except Admin User
      );

      console.log("Filtered customers:", customers);
      setUsers(customers);
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Error", "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAssign = async () => {
    if (!selectedUser || !duration || !params.toolId || !currentUser?._id) {
      Alert.alert("Error", "Please select a user and enter duration");
      return;
    }

    setCreating(true);
    try {
      const orderData = {
        nfcId: params.toolId as string,
        customerId: selectedUser,
        userId: currentUser._id,
        timeDuration: parseInt(duration),
        orderId: `ORDER-${Date.now()}`,
      };

      console.log("Creating order with data:", orderData);
      const response = await orderService.createOrder(orderData);
      console.log("Order created:", response);

      Alert.alert("Success", "Tool assigned successfully", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error: any) {
      console.error("Error creating order:", error);
      Alert.alert(
        "Error",
        "Failed to assign tool: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Customer</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.userList}>
        {filteredUsers.map((user: User) => (
          <TouchableOpacity
            key={user._id}
            style={[
              styles.userCard,
              selectedUser === user._id && styles.selectedUserCard,
            ]}
            onPress={() => setSelectedUser(user._id)}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.companyName}>{user.companyName}</Text>
            </View>
            <Ionicons
              name={
                selectedUser === user._id
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={24}
              color={selectedUser === user._id ? "#007AFF" : "#ccc"}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>Rental Duration (days)</Text>
          <TextInput
            style={styles.durationInput}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="Enter duration"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.assignButton,
            (!selectedUser || creating) && styles.disabledButton,
          ]}
          onPress={handleAssign}
          disabled={!selectedUser || creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.assignButtonText}>Assign Tool</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  userList: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedUserCard: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 15,
    marginBottom: 8,
    color: "#000",
  },
  durationInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
  },
  assignButton: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
