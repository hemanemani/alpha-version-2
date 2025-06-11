"use client"
import "./globals.css"
import AlphaSidebar from "@/components/alpha-sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AlphaTopBar from "@/components/alpha-topbar";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { motion } from "motion/react"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { ThemeProvider } from "next-themes";
import protectedRoutes from "@/lib/protectedRoutes";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [hovered, setHovered] = useState(false);
  const pathname = usePathname() ?? "/";
 
  
  const hoverRoutes:string[] = ["/inquiries/domestic","/inquiries/international","/inquiries/cancellations","/offers/domestic","/offers/international","/offers/cancellations","/orders/domestic","/orders/international","/orders/cancellations","/ads"];
  
  const isHoverEnabled: boolean = hoverRoutes.includes(pathname);
  const SIDEBAR_WIDTH:number = isHoverEnabled ? 60 : 240;
  const isLoginPage = pathname === '/'


const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
const user = storedUser ? JSON.parse(storedUser) : null;
  
  return (
    <AuthProvider>

    <html lang="en" suppressHydrationWarning>
      <body className={`${!isLoginPage ? 'min-h-screen bg-cover bg-center bg-no-repeat flex' : ''}`}
      // style={{ backgroundImage: isLoginPage ? "url('/images/alpha-background.jpg')" : undefined }}
        // style={{ backgroundImage: "url('/images/alpha-background.jpg')" }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <>
         {isLoginPage ? 
            <div className="absolute min-h-screen w-full">

              <AuroraBackground className="inset-0 z-0" >
              <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="relative flex flex-col gap-4 items-center justify-center px-4"
              >
              </motion.div>
              </AuroraBackground>
            </div>
          : ''}
            

        { !isLoginPage && <AlphaTopBar drawerWidth={SIDEBAR_WIDTH} user={user} /> }
        { !isLoginPage && <AlphaSidebar
          drawerWidth={SIDEBAR_WIDTH}
          isHoverEnabled={isHoverEnabled}
          hovered={hovered}
          setHovered={setHovered}
          user={user}
        /> }
        <main className={`flex-1 relative ${isLoginPage ? 'p-0' : 'mt-8 p-3'}`} style={{ marginLeft: isLoginPage ? 0 : (isHoverEnabled ? 0 : SIDEBAR_WIDTH), width: isLoginPage ? '100%' : (isHoverEnabled ? '96%' : '100%') }}>
          <div className={`${isLoginPage ? 'w-full mt-0' : (isHoverEnabled ? 'w-[96%] mt-12' : 'w-[100%] mt-12')} block ml-auto`}>
          {protectedRoutes[pathname] ? (
                <ProtectedRoute allowedAccess={protectedRoutes[pathname]} selectedPage={pathname}>
                  {children}
                </ProtectedRoute>
              ) : (
                children
              )}

          </div>
        </main>
        </>
        </ThemeProvider>
      </body>
    </html>
    </AuthProvider>

  );
}
