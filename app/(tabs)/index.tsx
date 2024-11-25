import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/auth";
import { orderService } from "../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    toolsInUse: 0,
    availableTools: 0,
    overdueRentals: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const loadData = async () => {
    try {
      const orders = await orderService.getAllOrders();

      // Calculate stats
      const activeOrders = orders.filter((order) => !order.returnDate);
      const overdueOrders = activeOrders.filter((order) => {
        const expiryDate = new Date(order.createdAt);
        expiryDate.setDate(expiryDate.getDate() + order.timeDuration);
        return new Date() > expiryDate;
      });

      setStats({
        toolsInUse: activeOrders.length,
        availableTools: 32, // You'll need to get this from your tools endpoint
        overdueRentals: overdueOrders.length,
      });

      // Get recent activities
      const recentOrders = orders
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((order) => ({
          id: order._id,
          type: "rental",
          toolName: order.nfcId,
          userName: order.customerId.name,
          time: new Date(order.createdAt).toLocaleDateString(),
        }));

      setRecentActivity(recentOrders);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section with Logout */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser?.name || "Admin"}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/scan")}
        >
          <Ionicons name="scan" size={24} color="#000" />
          <Text style={styles.actionButtonText}>Scan Tool</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/modals/add-tool")}
        >
          <Ionicons name="add-circle" size={24} color="#000" />
          <Text style={styles.actionButtonText}>Add Tool</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{stats.toolsInUse}</Text>
            <Text style={styles.statsLabel}>Tools in Use</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{stats.availableTools}</Text>
            <Text style={styles.statsLabel}>Available</Text>
          </View>
        </View>

        <View
          style={[
            styles.statsCard,
            styles.alertCard,
            stats.overdueRentals > 0 && styles.alertCardActive,
          ]}
        >
          <Ionicons
            name="alert-circle"
            size={24}
            color={stats.overdueRentals > 0 ? "#FF3B30" : "#666"}
          />
          <Text
            style={[
              styles.alertText,
              stats.overdueRentals > 0 && styles.alertTextActive,
            ]}
          >
            {stats.overdueRentals} Overdue Rentals
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity: any) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="arrow-forward-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Tool Rented</Text>
              <Text style={styles.activityToolName}>{activity.toolName}</Text>
              <Text style={styles.activityUser}>{activity.userName}</Text>
            </View>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: "#000",
  },
  welcomeText: {
    fontSize: 16,
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  quickActions: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    alignItems: "center",
    padding: 15,
  },
  actionButtonText: {
    marginTop: 5,
    color: "#000",
    fontSize: 12,
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  statsLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  alertCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
  },
  alertCardActive: {
    backgroundColor: "#FFF3F3",
  },
  alertText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  alertTextActive: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  activitySection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  activityDetails: {
    flex: 1,
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activityToolName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  activityUser: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  activityTime: {
    fontSize: 14,
    color: "#999",
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
