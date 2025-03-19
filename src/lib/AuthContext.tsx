"use client";


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axiosInstance from "./axios";
import { useRouter } from "next/navigation";

// Define the shape of the AuthContext
interface AuthContextType {
  accessLevel: string | null;
  allowedPages: string[];
  setAccessLevel: (level: string) => void;
  setAllowedPages: (pages: string[]) => void;
  isLoading: boolean;
}

// Create the AuthContext with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode; // Ensures children can be any valid React component
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.log("User is not authenticated.");
      setTimeout(() => setIsLoading(false), 500);
      return;
    }

    axiosInstance
      .get("/user-access", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAccessLevel(response.data.access_level);
        setAllowedPages(response.data.allowed_pages || []);
      })
      .catch(() => {
        setAccessLevel("view"); // Default to "view" on error
        localStorage.removeItem("authToken"); // Clear token on failure
        router.push("/");
      })
      .finally(() => {
        setTimeout(() => setIsLoading(false), 500);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ accessLevel, allowedPages, setAccessLevel, setAllowedPages, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
