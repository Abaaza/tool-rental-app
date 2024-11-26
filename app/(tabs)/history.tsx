import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { orderService } from "../services/api";
import { Order, FilterTypes } from "../../types/order";
import FilterComponent from "../../components/FilterComponent";

type SortField = FilterTypes["SortField"];
type SortOrder = FilterTypes["SortOrder"];
type StatusFilter = FilterTypes["StatusFilter"];

export default function HistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedTool, setSelectedTool] = useState("all");
  const [sortField, setSortField] = useState<SortField>("toolName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const resetFilters = () => {
    setSelectedUser("all");
    setSelectedCustomer("all");
    setSelectedStatus("all");
    setSelectedTool("all");
    setSortField("toolName");
    setSortOrder("asc");
  };

  const getFilteredOrders = () => {
    return orders
      .filter((order) => {
        const userMatch =
          selectedUser === "all" || order.userId._id === selectedUser;
        const customerMatch =
          selectedCustomer === "all" ||
          order.customerId._id === selectedCustomer;
        const toolMatch =
          selectedTool === "all" || order.toolName === selectedTool;

        let statusMatch;
        if (selectedStatus === "all") {
          statusMatch = true;
        } else if (selectedStatus === "active") {
          statusMatch = order.status === "active";
        } else if (selectedStatus === "returned") {
          statusMatch = order.status === "completed";
        } else if (selectedStatus === "overdue") {
          statusMatch = isExpired(order);
        }

        return userMatch && customerMatch && toolMatch && statusMatch;
      })
      .sort((a, b) => {
        let compareA: string;
        let compareB: string;

        switch (sortField) {
          case "assignedBy":
            compareA = a.userId.name.toLowerCase();
            compareB = b.userId.name.toLowerCase();
            break;
          case "assignedTo":
            compareA = a.customerId.name.toLowerCase();
            compareB = b.customerId.name.toLowerCase();
            break;
          case "status":
            compareA = a.status;
            compareB = b.status;
            break;
          case "toolName":
            compareA = a.toolName.toLowerCase();
            compareB = b.toolName.toLowerCase();
            break;
          default:
            compareA = a.toolName.toLowerCase();
            compareB = b.toolName.toLowerCase();
        }

        return sortOrder === "asc"
          ? compareA.localeCompare(compareB)
          : compareB.localeCompare(compareA);
      });
  };

  const loadOrders = async () => {
    try {
      const response = await orderService.getAllOrders();
      console.log("Loaded orders:", response);
      setOrders(response);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
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

  const handleReturn = async (order: Order) => {
    try {
      await orderService.returnOrder(order.orderId);
      Alert.alert("Success", "Order marked as returned successfully");
      loadOrders();
    } catch (error) {
      console.error("Error returning order:", error);
      Alert.alert(
        "Error",
        "Failed to mark order as returned. Please try again."
      );
    }
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
    if (order.status === "completed") return false;
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

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      <FilterComponent
        orders={orders}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        onResetFilters={resetFilters}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No rentals found</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const expired = isExpired(order);
            const isCompleted = order.status === "completed";

            return (
              <View key={order._id} style={styles.rentalCard}>
                <View style={styles.headerSection}>
                  <Text style={styles.orderId}>Order: {order.orderId}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isCompleted
                          ? "#E3F2FD"
                          : expired
                          ? "#FFEBEE"
                          : "#E8F5E9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isCompleted
                            ? "#1565C0"
                            : expired
                            ? "#C62828"
                            : "#2E7D32",
                        },
                      ]}
                    >
                      {isCompleted
                        ? "RETURNED"
                        : expired
                        ? "OVERDUE"
                        : "ACTIVE"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Ionicons name="build-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Tool</Text>
                    <Text style={styles.detailText}>{order.toolName}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Assigned To</Text>
                    <Text style={styles.detailText}>
                      {order.customerId.name} ({order.customerId.companyName})
                    </Text>
                  </View>
                </View>

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
                    <Text style={styles.dateLabel}>
                      {isCompleted ? "Return Date" : "Expiry Date"}
                    </Text>
                    <Text
                      style={[
                        styles.dateText,
                        expired && !isCompleted && styles.expiredText,
                      ]}
                    >
                      {isCompleted
                        ? formatDate(order.returnDate)
                        : getExpiryDate(order)}
                    </Text>
                  </View>
                </View>

                {!isCompleted && (
                  <TouchableOpacity
                    style={[
                      styles.returnButton,
                      expired && styles.returnButtonOverdue,
                    ]}
                    onPress={() => handleReturn(order)}
                  >
                    <Text style={styles.returnButtonText}>
                      Mark as Returned
                    </Text>
                  </TouchableOpacity>
                )}
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
  returnButton: {
    marginTop: 16,
    backgroundColor: "#2E7D32",
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  returnButtonOverdue: {
    backgroundColor: "#C62828",
  },
  returnButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
