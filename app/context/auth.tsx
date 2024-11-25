import { createContext, useContext, useState } from "react";

export interface User {
  _id: string;
  name: string;
  companyName: string;
  role?: "admin" | "customer";
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  signIn: (userData: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const signIn = (userData: User) => {
    console.log("Signing in with user:", userData); // Debug log
    setUser(userData);
    setIsLoggedIn(true);
  };

  const signOut = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  // Debug log to see current auth state
  console.log("Auth state:", { isLoggedIn, user });

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
