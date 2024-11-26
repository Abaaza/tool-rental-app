import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/auth";
import { orderService, toolService } from "../services/api";

// Define types
interface Order {
  _id: string;
  nfcId: string;
  toolName: string;
  customerId: {
    _id: string;
    name: string;
    companyName: string;
  };
  userId: {
    _id: string;
    name: string;
  };
  timeDuration: number;
  returnDate?: Date;
  createdAt: string;
  expiryDate: string;
  status: "active" | "completed" | "cancelled";
}

interface ActivityItem {
  id: string;
  type: "rental" | "return" | "overdue";
  toolName: string;
  userName: string;
  time: string;
  timestamp: string;
  orderId: string;
  isOverdue?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    toolsInUse: 0,
    availableTools: 0,
    overdueRentals: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else {
      return "Just now";
    }
  };

  const loadData = async () => {
    try {
      setError(null);
      console.log("Starting data load...");

      const [tools, orders] = await Promise.all([
        toolService.getAllTools(),
        orderService.getAllOrders(),
      ]);

      // Calculate stats for the dashboard
      const activeOrders = orders.filter(
        (order: Order) => order.status === "active"
      );
      const overdueOrders = activeOrders.filter((order: Order) => {
        const expiryDate = new Date(order.expiryDate);
        return new Date() > expiryDate;
      });

      const availableTools = tools.filter(
        (tool) => tool.status === "available"
      ).length;

      setStats({
        toolsInUse: activeOrders.length,
        availableTools: availableTools,
        overdueRentals: overdueOrders.length,
      });

      // Enhanced activity tracking
      const activities: ActivityItem[] = [];
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      orders.forEach((order: Order) => {
        const isOverdue = new Date() > new Date(order.expiryDate);
        const orderTimestamp = new Date(order.createdAt);

        // Only include activities from the last 4 days
        if (orderTimestamp > fourDaysAgo) {
          // Add rental activity
          activities.push({
            id: `rental-${order._id}`,
            type: "rental",
            toolName: order.toolName,
            userName: order.customerId.name,
            time: getTimeAgo(order.createdAt),
            timestamp: order.createdAt,
            orderId: order._id,
            isOverdue: isOverdue && order.status === "active",
          });

          // Add overdue activity if applicable
          if (isOverdue && order.status === "active") {
            activities.push({
              id: `overdue-${order._id}`,
              type: "overdue",
              toolName: order.toolName,
              userName: order.customerId.name,
              time: getTimeAgo(order.expiryDate),
              timestamp: order.expiryDate,
              orderId: order._id,
              isOverdue: true,
            });
          }

          // Add return activity if completed
          if (order.status === "completed" && order.returnDate) {
            activities.push({
              id: `return-${order._id}`,
              type: "return",
              toolName: order.toolName,
              userName: order.customerId.name,
              time: getTimeAgo(order.returnDate.toString()),
              timestamp: order.returnDate.toString(),
              orderId: order._id,
              isOverdue: false,
            });
          }
        }
      });

      // Sort activities by timestamp, most recent first
      const sortedActivities = activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10); // Keep only 10 most recent activities

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Add a function to get the appropriate icon and color for each activity type
  const getActivityStyle = (activity: ActivityItem) => {
    switch (activity.type) {
      case "rental":
        return {
          icon: "arrow-forward-circle",
          color: activity.isOverdue ? "#FF3B30" : "#2196F3",
          title: "Tool Rented",
        };
      case "return":
        return {
          icon: "checkmark-circle",
          color: "#4CAF50",
          title: "Tool Returned",
        };
      case "overdue":
        return {
          icon: "alert-circle",
          color: "#FF3B30",
          title: "Tool Overdue",
        };
      default:
        return {
          icon: "information-circle",
          color: "#666",
          title: "Status Update",
        };
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      loadData();
    }, 60000); // Refresh every minute

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

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

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

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
        {recentActivity.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity</Text>
          </View>
        ) : (
          recentActivity.map((activity) => {
            const style = getActivityStyle(activity);
            return (
              <View key={activity.id} style={styles.activityCard}>
                <View
                  style={[
                    styles.activityIconContainer,
                    activity.isOverdue && styles.overdueIconContainer,
                  ]}
                >
                  <Ionicons
                    name={style.icon as any}
                    size={24}
                    color={style.color}
                  />
                </View>
                <View style={styles.activityDetails}>
                  <Text
                    style={[
                      styles.activityTitle,
                      activity.isOverdue && styles.overdueText,
                    ]}
                  >
                    {style.title}
                  </Text>
                  <Text style={styles.activityToolName}>
                    {activity.toolName}
                  </Text>
                  <Text style={styles.activityUser}>{activity.userName}</Text>
                </View>
                <Text style={[styles.activityTime, { color: style.color }]}>
                  {activity.time}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
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
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: "#FFF3F3",
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
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
    width: 60,
    height: 60,
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
  overdueIconContainer: {
    backgroundColor: "#FFF3F3",
  },
  overdueText: {
    color: "#FF3B30",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyStateText: {
    color: "#666",
    fontSize: 14,
  },
});
