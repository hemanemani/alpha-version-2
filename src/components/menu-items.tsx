"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Home, FileText, User, ChevronDown, ChevronUp, Tags, Users, ShoppingBag, Loader } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/AuthContext";
import protectedRoutes from "@/lib/protectedRoutes"

interface MenuItemsProps {
  isHoverEnabled: boolean;
  hovered: boolean;
}

const MENU_STORAGE_KEY = "menuOpenState";

export function MenuItems({ isHoverEnabled, hovered }: MenuItemsProps) {

  const pathname = usePathname() ?? "/";
  
  const [searchQuery, setSearchQuery] = useState("");

  const [menuState, setMenuState] = useState<{ [key: string]: boolean }>({});
  const { accessLevel, allowedPages,isAdmin } = useAuth();



  const renderMenuHeader = () =>{
    return(
      <h2 className="mb-2 px-2 text-[0.8rem] font-inter-medium text-[#8e8081]">Menu</h2>
    )
  }


  const menuItems = [
    {
      label: "Home",
      icon: <Home className="mr-2 h-4 w-4" />,
      collapsible: true,
      subItems: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Analytics", href: "/analytics" },
      ],
    },
    {
      label: "Inquiries",
      icon: <FileText className="mr-2 h-4 w-4" />,
      collapsible: true,
      subItems: [
        { label: "Domestic", href: "/inquiries/domestic" },
        { label: "International", href: "/inquiries/international" },
        { label: "Cancelled", href: "/inquiries/cancellations" },
      ],
    },
    {
      label: "Offers",
      icon: <Tags className="mr-2 h-4 w-4" />,
      collapsible: true,
      subItems: [
        { label: "Domestic", href: "/offers/domestic" },
        { label: "International", href: "/offers/international" },
        { label: "Cancelled", href: "/offers/cancellations" },
      ],
    },
    {
      label: "Orders",
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
      collapsible: true,
      subItems: [
        { label: "Domestic", href: "/orders/domestic" },
        { label: "International", href: "/orders/international" },
        { label: "Cancelled", href: "/orders/cancellations" },
      ],
    },
    {
      label: "Sellers",
      icon: <Users className="mr-2 h-4 w-4" />,
      collapsible: true,
      subItems: [
        { label: "Sellers", href: "/sellers/index" },
        { label: "Products", href: "/sellers/products" },
        { label: "Ads", href: "/ads" },
      ],
    },
    { label: "Users", 
      icon: <User className="mr-2 h-4 w-4" />,
      href: "/users",
   },
  ];

  const filteredMenuItems = useMemo(() =>
    menuItems
      .map((item) => {
        // Collapsible items
        if (item.collapsible && item.subItems) {
          let allowedSubItems: typeof item.subItems = [];

          if (accessLevel === "master") {
            allowedSubItems = item.subItems;
          } else if (accessLevel === "full") {
            allowedSubItems = item.subItems.filter((sub) => {
              const roles = protectedRoutes[sub.href] || [];
              return roles.includes("full");
            });
          } else if (accessLevel === "limited") {
            allowedSubItems = item.subItems.filter((sub) =>
              allowedPages.includes(sub.href)
            );
          } else if (accessLevel === "view") {
            allowedSubItems = item.subItems.filter((sub) => {
              const roles = protectedRoutes[sub.href] || [];
              return roles.includes("view");
            });
          }

          const visibleSubItems = allowedSubItems.filter((sub) =>
            sub.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return {
            ...item,
            subItems: visibleSubItems,
          };
        }

        // Non-collapsible items (filter by label or href)
        let allowItem = false;

        if (accessLevel === "master") {
          allowItem = true;
        } else if (accessLevel === "full") {
          const roles = protectedRoutes[item.href || ""] || [];
          allowItem = roles.includes("full");
        } else if (accessLevel === "limited" && item.href) {
          allowItem = allowedPages.includes(item.href);
        } else if (accessLevel === "view") {
          const roles = protectedRoutes[item.href || ""] || [];
          allowItem = roles.includes("view");
        }

        return allowItem &&
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
          ? item
          : null;
      })
      .filter((item) =>
        item &&
        (
          (item.collapsible && item.subItems && item.subItems.length > 0) ||
          (!item.collapsible)
        )
      ) as typeof menuItems,
    [menuItems, searchQuery, allowedPages, accessLevel, isAdmin]
  );

  
  


  useEffect(() => {
    const savedState = localStorage.getItem(MENU_STORAGE_KEY);
    const initialState = savedState ? JSON.parse(savedState) : {};
  
    filteredMenuItems.forEach((item) => {
      if (item.collapsible && item.subItems.some(subItem => subItem.href === pathname)) {
        initialState[item.label] = true;
      }
    });
  
    setMenuState(prevState => {
      if (JSON.stringify(prevState) === JSON.stringify(initialState)) {
        return prevState;
      }
      return initialState;
    });
  
  }, [pathname, filteredMenuItems]);
  
  

  const toggleMenu = (key: string) => {
    setMenuState(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };


  return (
    <>
      {/* Search Input */}
      <div className={`relative mt-10 mb-4 transition-opacity duration-300 ${
        !isHoverEnabled || hovered ? "opacity-100" : "opacity-0"
      }`}>
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search"
          className="pl-8 bg-white border-none font-inter-light"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Menu Header (e.g. "Menu", "Manage", etc.) */}
      <div className={`transition-opacity duration-300 ${
        !isHoverEnabled || hovered ? "opacity-100" : "opacity-0"
      }`}>
        {renderMenuHeader()}
      </div>


      {/* Sidebar Menu */}
      <nav className="space-y-2">
        <SidebarMenu className="text-[#817f81] text-[0.8rem] gap-3">
          {filteredMenuItems.map((item, index) =>
            item.collapsible ? (
              // Collapsible Menu
              <Collapsible key={index} open={menuState[item.label] ?? false} onOpenChange={(open) => setMenuState(prev => ({...prev, [item.label]: open}))}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => toggleMenu(item.label)}
                      className="cursor-pointer font-inter-medium"
                    >
                      {item.icon} {item.label}
                      {menuState[item.label] ? (
                        <ChevronUp className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <div className="relative ml-6 mt-2 pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gray-300">
                    {item.subItems.map((subItem, subIndex) => (
                      <SidebarMenuItem key={subIndex}>
                        <Link href={subItem.href}>
                          <SidebarMenuButton
                            className={`cursor-pointer ${
                              pathname.startsWith(subItem.href) ? "text-black bg-[#f3f4f6] font-inter-semibold" : "font-normal text-[#817f81]"
                            }`}
                          >
                            {subItem.label}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // Non-Collapsible Menu Item
              <SidebarMenuItem key={index}>
                <Link href={item.href!}>
                  <SidebarMenuButton
                    className={`cursor-pointer ${
                      pathname === item.href ? "text-black" : "font-normal text-[#817f81] font-inter-medium"
                    }`}
                  >
                    {item.icon} {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          )}

          {/* No results found message */}
          {filteredMenuItems.length === 0 && (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
          )}
        </SidebarMenu>
      </nav>


    
    </>
    
  )
}

