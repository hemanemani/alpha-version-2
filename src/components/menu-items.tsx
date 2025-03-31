"use client"

import React, { useState } from "react"
import { Home, FileText, User, ChevronDown, ChevronUp, Tags } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface MenuItemsProps {
  isHoverEnabled: boolean;
  hovered: boolean;
}


export function MenuItems({ isHoverEnabled, hovered }: MenuItemsProps) {

  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isInquiriesOpen, setIsInquiriesOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState("");


  const renderMenuHeader = () =>{
    return(
      <h2 className="mb-2 px-2 text-[0.8rem] font-[500] text-[#8e8081]">Menu</h2>
    )
  }


  const menuItems = [
    {
      label: "Home",
      icon: <Home className="mr-2 h-4 w-4" />,
      collapsible: true,
      isOpen: isHomeOpen,
      setOpen: setIsHomeOpen,
      subItems: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Analytics", href: "/analytics" },
      ],
    },
    {
      label: "Inquiries",
      icon: <FileText className="mr-2 h-4 w-4" />,
      collapsible: true,
      isOpen: isInquiriesOpen,
      setOpen: setIsInquiriesOpen,
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
      isOpen: isOffersOpen,
      setOpen: setIsOffersOpen,
      subItems: [
        { label: "Domestic", href: "/offers/domestic" },
        { label: "International", href: "/offers/international" },
        { label: "Cancelled", href: "/offers/cancellations" },
      ],
    },
    { label: "Users", icon: <User className="mr-2 h-4 w-4" />, href: "/users" },
  ];

  const filteredMenuItems = menuItems
  .map((item) => ({
    ...item,
    subItems: item.subItems
      ? item.subItems.filter((sub) => sub.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : [],
  }))
  .filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subItems && item.subItems.length > 0)
  );






  return (
    <>
      {(!isHoverEnabled || hovered) && (
        <div className="relative mt-10 mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-8 bg-white border-none font-inter-light"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      {isHoverEnabled ? (hovered ?  renderMenuHeader() : "") :  renderMenuHeader()}

            {/* Sidebar Menu */}
            <nav className="space-y-2">
        <SidebarMenu className="text-[#817f81] text-[0.8rem] gap-3 font-[500]">
          {filteredMenuItems.map((item, index) =>
            item.collapsible ? (
              // Collapsible Menu
              <Collapsible key={index} open={item.isOpen} onOpenChange={item.setOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => item.setOpen(!item.isOpen)}
                      className="cursor-pointer"
                    >
                      {item.icon} {item.label}
                      {item.isOpen ? (
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
                              pathname === subItem.href ? "font-[500] text-black bg-[#f3f4f6]" : "font-normal text-[#817f81]"
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
                      pathname === item.href ? "font-[500] text-black" : "font-normal text-[#817f81]"
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
            <p className="text-gray-500 text-sm px-4 py-2">No matching items found</p>
          )}
        </SidebarMenu>
      </nav>


    
    </>
    
  )
}

