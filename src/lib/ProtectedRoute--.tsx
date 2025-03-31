"use client";

import { ReactNode,useState,useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";


interface ProtectedRouteProps {
  children: ReactNode;
  allowedAccess: string[];
  selectedPage?: string; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedAccess, selectedPage }) => {
  const { accessLevel, allowedPages, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading) return;

    const isAuthenticated = localStorage.getItem("authToken");
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    console.log("Authorization check:", {
      path: selectedPage,
      accessLevel,
      allowedAccess,
      allowedPages,
      isAllowed: allowedAccess.includes(accessLevel!)
    });

    if (!allowedAccess.includes(accessLevel!)) {
      console.log("Redirecting to unauthorized - access level not allowed");
      router.replace("/unauthorized");
      return;
    }

    if (accessLevel === "limited" && selectedPage && !allowedPages.includes(selectedPage.replace(/^\//, ""))) {
      console.log("Redirecting to unauthorized - page not in allowedPages");
      router.replace("/unauthorized");
      return;
    }
  }, [isClient, isLoading, accessLevel, allowedAccess, router, allowedPages, selectedPage]);

  if (!isClient || isLoading) {
    return <div>Loading...</div>;
  }

  return children;
};
export default ProtectedRoute;