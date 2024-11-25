import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { orderService } from "../services/api";

type Order = {
  _id: string;
  nfcId: string;
  toolName: string; // Add this
  customerId: {
    _id: string;
    name: string;
    companyName: string;
  };
  userId: {
    _id: string;
    name: string;
    companyName: string;
  };
  timeDuration: number;
  orderId: string;
  createdAt: string;
  expiryDate: string;
};

export default function HistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await orderService.getAllOrders();
      console.log("Loaded orders:", response);
      setOrders(response);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatDate = (dateString: string | undefined) => {
    try {
      if (!dateString) {
        console.log("No date string provided");
        const now = new Date();
        return now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log("Invalid date string:", dateString);
        return "Invalid date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const getExpiryDate = (order: Order) => {
    try {
      const startDate = new Date(order.createdAt || new Date());
      const expiryDate = new Date(startDate);
      expiryDate.setDate(startDate.getDate() + order.timeDuration);
      return formatDate(expiryDate.toISOString());
    } catch (error) {
      console.error("Expiry date calculation error:", error);
      return "Invalid date";
    }
  };

  const isExpired = (order: Order) => {
    try {
      const startDate = new Date(order.createdAt || new Date());
      const expiryDate = new Date(startDate);
      expiryDate.setDate(startDate.getDate() + order.timeDuration);
      return new Date() > expiryDate;
    } catch (error) {
      console.error("Expiry check error:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading rentals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No rentals found</Text>
          </View>
        ) : (
          orders.map((order) => {
            const expired = isExpired(order);

            return (
              <View key={order._id} style={styles.rentalCard}>
                {/* Order ID and Status */}
                <View style={styles.headerSection}>
                  <Text style={styles.orderId}>Order: {order.orderId}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: expired ? "#FFEBEE" : "#E8F5E9" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: expired ? "#C62828" : "#2E7D32" },
                      ]}
                    >
                      {expired ? "EXPIRED" : "ACTIVE"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Tool Info */}
                <View style={styles.detailRow}>
                  <Ionicons name="build-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Tool</Text>
                    <Text style={styles.detailText}>{order.nfcId}</Text>
                  </View>
                </View>

                {/* Assigned To */}
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Assigned To</Text>
                    <Text style={styles.detailText}>
                      {order.customerId.name} ({order.customerId.companyName})
                    </Text>
                  </View>
                </View>

                {/* Assigned By */}
                <View style={styles.detailRow}>
                  <Ionicons name="create-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Assigned By</Text>
                    <Text style={styles.detailText}>
                      {order.userId.name} ({order.userId.companyName})
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Dates Section */}
                <View style={styles.datesContainer}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.dateLabel}>Assigned Date</Text>
                    <Text style={styles.dateText}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>

                  <View style={[styles.dateColumn, styles.dateColumnBorder]}>
                    <Text style={styles.dateLabel}>Duration</Text>
                    <Text style={styles.dateText}>
                      {order.timeDuration} days
                    </Text>
                  </View>

                  <View style={styles.dateColumn}>
                    <Text style={styles.dateLabel}>Expiry Date</Text>
                    <Text
                      style={[styles.dateText, expired && styles.expiredText]}
                    >
                      {getExpiryDate(order)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ... styles remain the same ...
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
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  rentalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  datesContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dateColumn: {
    flex: 1,
    alignItems: "center",
  },
  dateColumnBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#eee",
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  expiredText: {
    color: "#C62828",
  },
});
