import { useAuth } from "@/lib/AuthContext";
import protectedRoutes from "@/lib/protectedRoutes";


export const usePermission = () => {
  const { accessLevel, allowedPages } = useAuth();

  const hasAccessTo = (route: string): boolean => {
    const allowedRoles = protectedRoutes[route] || [];

    // Admin full access
    if (accessLevel === "master" || accessLevel === "full") return true;

      // Full access: use static check
      if (accessLevel === "master" || accessLevel === "full") {
        return allowedRoles.includes("full");
      }

      // Limited access: must be in allowedPages
      if (accessLevel === "limited") {
        return allowedPages.includes(route);
      }

        if (accessLevel === "view") {
           return allowedRoles.includes("view");
      }


      return false;
  };
  




  return { hasAccessTo };
};
