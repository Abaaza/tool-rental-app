import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order, FilterTypes } from "../types/order";

type SortField = FilterTypes["SortField"];
type StatusFilter = "all" | "active" | "returned" | "overdue";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterComponentProps {
  orders: Order[];
  selectedUser: string;
  setSelectedUser: (userId: string) => void;
  selectedCustomer: string;
  setSelectedCustomer: (customerId: string) => void;
  selectedStatus: StatusFilter;
  setSelectedStatus: (status: StatusFilter) => void;
  selectedTool: string;
  setSelectedTool: (toolName: string) => void;
  onResetFilters: () => void;
}

const FilterModal = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedValue === item.value && styles.selectedOption,
              ]}
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedValue === item.value && styles.selectedOptionText,
                ]}
              >
                {item.label}
              </Text>
              {selectedValue === item.value && (
                <Ionicons name="checkmark" size={20} color="#2E7D32" />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);

const FilterComponent: React.FC<FilterComponentProps> = ({
  orders,
  selectedUser,
  setSelectedUser,
  selectedCustomer,
  setSelectedCustomer,
  selectedStatus,
  setSelectedStatus,
  selectedTool,
  setSelectedTool,
  onResetFilters,
}) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);

  // Generate options from orders
  const userOptions = React.useMemo(() => {
    const users = new Map();
    orders.forEach((order) => {
      users.set(order.userId._id, order.userId.name);
    });
    return [
      { label: "All Users", value: "all" },
      ...Array.from(users).map(([id, name]) => ({
        label: name,
        value: id,
      })),
    ];
  }, [orders]);

  const customerOptions = React.useMemo(() => {
    const customers = new Map();
    orders.forEach((order) => {
      customers.set(order.customerId._id, order.customerId.name);
    });
    return [
      { label: "All Customers", value: "all" },
      ...Array.from(customers).map(([id, name]) => ({
        label: name,
        value: id,
      })),
    ];
  }, [orders]);

  const toolOptions = React.useMemo(() => {
    const tools = new Set(orders.map((order) => order.toolName));
    return [
      { label: "All Tools", value: "all" },
      ...Array.from(tools).map((name) => ({
        label: name,
        value: name,
      })),
    ];
  }, [orders]);

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Returned", value: "returned" },
    { label: "Overdue", value: "overdue" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
      >
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowUserModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Assigned By:{" "}
            {userOptions.find((u) => u.value === selectedUser)?.label || "All"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCustomerModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Assigned To:{" "}
            {customerOptions.find((c) => c.value === selectedCustomer)?.label ||
              "All"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Status:{" "}
            {statusOptions.find((s) => s.value === selectedStatus)?.label ||
              "All"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowToolModal(true)}
        >
          <Text style={styles.filterButtonText}>
            Tool:{" "}
            {toolOptions.find((t) => t.value === selectedTool)?.label || "All"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.resetButton} onPress={onResetFilters}>
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>

      <FilterModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Select User"
        options={userOptions}
        selectedValue={selectedUser}
        onSelect={setSelectedUser}
      />

      <FilterModal
        visible={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Select Customer"
        options={customerOptions}
        selectedValue={selectedCustomer}
        onSelect={setSelectedCustomer}
      />

      <FilterModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Select Status"
        options={statusOptions}
        selectedValue={selectedStatus}
        onSelect={(value) => setSelectedStatus(value as StatusFilter)}
      />

      <FilterModal
        visible={showToolModal}
        onClose={() => setShowToolModal(false)}
        title="Select Tool"
        options={toolOptions}
        selectedValue={selectedTool}
        onSelect={setSelectedTool}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filtersRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
  },
  filterButtonText: {
    fontSize: 16,
    color: "#333",
    marginRight: 4,
  },
  resetButton: {
    backgroundColor: "#ff3b30",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#f8f9fa",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});

export default FilterComponent;
