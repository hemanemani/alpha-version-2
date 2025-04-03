"use client"
import "./globals.css"
import AlphaSidebar from "@/components/alpha-sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AlphaTopBar from "@/components/alpha-topbar";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  const protectedRoutes: Record<string, string[]> = {
    // Dashboard & Analytics
    "/analytics": ["full"],
  
    // Domestic Inquiries
    "/inquiries/domestic": ["full", "limited", "view"],
    "/inquiries/domestic/create": ["full", "limited"],
    "/inquiries/domestic/edit": ["full", "limited"],
    "/inquiries/domestic/upload": ["full", "limited"],
    "/inquiries/domestic/cancellations": ["full", "limited", "view"],
  
    // International Inquiries
    "/inquiries/international": ["full", "limited", "view"],
    "/inquiries/international/create": ["full", "limited"],
    "/inquiries/international/edit": ["full", "limited"],
    "/inquiries/international/upload": ["full", "limited"],
    "/inquiries/international/cancellations": ["full", "limited", "view"],
  
    // Offers
    "/offers/domestic": ["full", "limited", "view"],
    "/offers/international": ["full", "limited", "view"],
    "/offers/cancellations": ["full", "limited", "view"],
  
    // User Management (Admin Only)
    "/users": ["full"],
    "/users/create": ["full"],
    "/users/edit": ["full"],
  };
  
  const hoverRoutes:string[] = ["/inquiries/domestic","/inquiries/international","/inquiries/cancellations","/offers/domestic","/offers/international","/offers/cancellations"];
  
  const isHoverEnabled: boolean = hoverRoutes.includes(pathname);
  const SIDEBAR_WIDTH:number = isHoverEnabled ? 60 : 240;
  const isLoginPage = pathname === '/'


const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
const user = storedUser ? JSON.parse(storedUser) : null;
  
  return (
    <AuthProvider>

    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-cover bg-center bg-no-repeat flex"
      style={{ backgroundImage: isLoginPage ? "url('/images/alpha-background.jpg')" : undefined }}
        // style={{ backgroundImage: "url('/images/alpha-background.jpg')" }}
        >
        { !isLoginPage && <AlphaTopBar drawerWidth={SIDEBAR_WIDTH} user={user} /> }
        { !isLoginPage && <AlphaSidebar
          drawerWidth={SIDEBAR_WIDTH}
          isHoverEnabled={isHoverEnabled}
          hovered={hovered}
          setHovered={setHovered}
          user={user}
        /> }
        <main className={`flex-1 ${isLoginPage ? 'p-0' : 'mt-8 p-3'}`} style={{ marginLeft: isLoginPage ? 0 : (isHoverEnabled ? 0 : SIDEBAR_WIDTH), width: isLoginPage ? '100%' : (isHoverEnabled ? '92%' : '100%') }}>
          <div className={`${isLoginPage ? 'w-full' : (isHoverEnabled ? 'w-[92%]' : 'w-[100%]')} mt-12 block mx-auto pl-3`}>
          {protectedRoutes[pathname] ? (
                <ProtectedRoute allowedAccess={protectedRoutes[pathname]} selectedPage={pathname}>
                  {children}
                </ProtectedRoute>
              ) : (
                children
              )}

          </div>
        </main>
      </body>
    </html>
    </AuthProvider>

  );
}
