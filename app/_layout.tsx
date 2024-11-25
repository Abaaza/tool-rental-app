import { Stack } from "expo-router";
import { AuthProvider } from "./context/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/select-user"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modals/tool-details"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modals/add-tool"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
