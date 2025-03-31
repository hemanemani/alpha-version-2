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
  const { accessLevel, allowedPages, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  // const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading) return;

    const isAuthenticated = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!isAuthenticated) {
      // setRedirecting(true);
      router.replace("/");
      return;
    }

    if (!allowedAccess.includes(accessLevel!)) {
      // setRedirecting(true);
      router.replace("/unauthorized");
      return;
    }

    if (accessLevel === "limited" && selectedPage){
          const formattedPage = selectedPage.replace(/^\//, "");
          const formattedAllowedPages = allowedPages.map(page => page.replace(/^\//, ""));
          
          if (!formattedAllowedPages.includes(formattedPage)) {
            router.replace("/unauthorized");
            return;
          }
        }
  }, [isClient, isLoading, accessLevel, allowedAccess, router,isAdmin]);

  // if (!isClient || isLoading || redirecting) {
  //   return <div>Loading...</div>;
  // }


  // Allow full access if the user has "full" access level
  if (isAdmin === 1 && accessLevel === "full") {
    return children;
  }

  // Allow access for "limited" users with "view" permission and access to the selected page
  if (
    isAdmin === 0 &&
    accessLevel === "limited" &&
    allowedAccess.includes("view") &&
    allowedPages.includes(selectedPage || "")
  ) {
    return children;
  }

  return children;
};

export default ProtectedRoute;