import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock tools data - replace with API call later
const mockTools = [
  {
    id: "T001",
    name: "Power Drill XR20",
    serialNumber: "DR789456",
    status: "Available",
    rentalPrice: 25.0,
    category: "Power Tools",
  },
  {
    id: "T002",
    name: "Circular Saw Pro",
    serialNumber: "CS456789",
    status: "In Use",
    rentalPrice: 35.0,
    category: "Power Tools",
  },
  {
    id: "T003",
    name: "Hammer Drill Heavy",
    serialNumber: "HD123456",
    status: "Available",
    rentalPrice: 45.0,
    category: "Power Tools",
  },
  {
    id: "T004",
    name: "Ladder 12ft",
    serialNumber: "LD987654",
    status: "Available",
    rentalPrice: 15.0,
    category: "Access Equipment",
  },
];

export default function ManualEntryModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"name" | "serial">("name");

  const filteredTools = mockTools.filter((tool) => {
    const query = searchQuery.toLowerCase();
    return searchType === "name"
      ? tool.name.toLowerCase().includes(query)
      : tool.serialNumber.toLowerCase().includes(query);
  });

  const handleToolSelect = (tool: (typeof mockTools)[0]) => {
    router.push({
      pathname: "/modals/tool-details",
      params: { tool: JSON.stringify(tool) },
    } as any);
  };

  const renderToolStatus = (status: string) => {
    const isAvailable = status === "Available";
    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isAvailable ? "#E8F5E9" : "#FFF3E0" },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: isAvailable ? "#2E7D32" : "#EF6C00" },
          ]}
        >
          {status}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Tool Search</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchTypeToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              searchType === "name" && styles.toggleButtonActive,
            ]}
            onPress={() => setSearchType("name")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                searchType === "name" && styles.toggleButtonTextActive,
              ]}
            >
              Search by Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              searchType === "serial" && styles.toggleButtonActive,
            ]}
            onPress={() => setSearchType("serial")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                searchType === "serial" && styles.toggleButtonTextActive,
              ]}
            >
              Search by Serial
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              searchType === "name"
                ? "Enter tool name..."
                : "Enter serial number..."
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching tools...</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsList}>
          {filteredTools.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#666" />
              <Text style={styles.noResultsText}>No tools found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search term or category
              </Text>
            </View>
          ) : (
            filteredTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => handleToolSelect(tool)}
              >
                <View style={styles.toolInfo}>
                  <Text style={styles.toolName}>{tool.name}</Text>
                  <Text style={styles.serialNumber}>
                    SN: {tool.serialNumber}
                  </Text>
                  <View style={styles.toolDetails}>
                    <Text style={styles.category}>{tool.category}</Text>
                    <Text style={styles.price}>${tool.rentalPrice}/day</Text>
                  </View>
                </View>
                <View style={styles.toolStatus}>
                  {renderToolStatus(tool.status)}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#666"
                    style={styles.chevron}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
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
  searchSection: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchTypeToggle: {
    flexDirection: "row",
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#E3F2FD",
  },
  toggleButtonText: {
    color: "#666",
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  resultsList: {
    flex: 1,
    padding: 12,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  toolCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  serialNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  toolDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    color: "#666",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  toolStatus: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chevron: {
    marginTop: 4,
  },
});
