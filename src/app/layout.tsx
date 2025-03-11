"use client"
import "./globals.css"
import AlphaSidebar from "@/components/alpha-sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AlphaTopBar from "@/components/alpha-topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [hovered, setHovered] = useState(true);
  const pathname = usePathname();
  const hoverRoutes:string[] = ["/inquiries/domestic","/inquiries/international","/inquiries/cancellations","/offers/domestic","/offers/international","/offers/cancellations"];
  const isHoverEnabled: boolean = hoverRoutes.includes(pathname);
  const SIDEBAR_WIDTH:number = isHoverEnabled ? 60 : 240;
  const isLoginPage = pathname === '/'
  
  return (
    <html lang="en">
      <body className="min-h-screen bg-cover bg-center bg-no-repeat flex"
        style={{ backgroundImage: "url('/images/alpha-background.jpg')" }}>
        { !isLoginPage && <AlphaTopBar drawerWidth={SIDEBAR_WIDTH} /> }
        { !isLoginPage && <AlphaSidebar
          drawerWidth={SIDEBAR_WIDTH}
          isHoverEnabled={isHoverEnabled}
          hovered={hovered}
          setHovered={setHovered}
        /> }
        <main className={`flex-1 ${isLoginPage ? 'p-0' : 'mt-8 p-3'}`} style={{ marginLeft: isLoginPage ? 0 : (isHoverEnabled ? 0 : SIDEBAR_WIDTH), width: isLoginPage ? '100%' : '87%' }}>
          <div className={`${isLoginPage ? 'w-full' : 'w-[87%] mt-12'} block mx-auto`}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
