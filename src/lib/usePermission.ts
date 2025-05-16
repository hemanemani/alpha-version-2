import { useAuth } from "@/lib/AuthContext";
import protectedRoutes from "@/lib/protectedRoutes";


export const usePermission = () => {
  const { accessLevel, allowedPages, isAdmin } = useAuth();

  const hasAccessTo = (route: string): boolean => {
    const allowedRoles = protectedRoutes[route] || [];

    // Admin full access
    if (isAdmin === 1 && accessLevel === "full") return true;

    // Limited users with page-level restrictions
    if (
      isAdmin === 0 &&
      accessLevel === "limited" &&
      allowedRoles.includes("view") &&
      allowedPages.includes(route)
    ) {
      return true;
    }

    return allowedRoles.includes(accessLevel!);
  };

  return { hasAccessTo };
};
