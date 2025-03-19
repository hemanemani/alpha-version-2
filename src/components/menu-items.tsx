"use client"

import React, { useState } from "react"
import { Home, FileText, User, ChevronDown, ChevronUp, Tags } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MenuItems() {

  const [isInquiriesOpen, setIsInquiriesOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      <SidebarMenu className="text-[#817f81] text-[0.8rem] gap-3 font-[500]">
        <SidebarMenuItem>
          <Link href="/dashboard">
            <SidebarMenuButton className={`cursor-pointer ${ pathname === "/dashboard" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <Collapsible open={isInquiriesOpen} onOpenChange={setIsInquiriesOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton onClick={() => setIsInquiriesOpen(!isInquiriesOpen)} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Inquiries
                {isInquiriesOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>
          <CollapsibleContent>
            <div className="relative ml-6 mt-2 pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gray-300">
              <SidebarMenuItem>
                <Link href="/inquiries/domestic">
                <SidebarMenuButton className={`cursor-pointer ${ pathname === "/inquiries/domestic" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
                    Domestic</SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
              <Link href="/inquiries/international">
                <SidebarMenuButton className={`cursor-pointer ${ pathname === "/inquiries/international" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>                  
                  International
                </SidebarMenuButton>
              </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/inquiries/cancellations">
                  <SidebarMenuButton className={`cursor-pointer ${ pathname === "/inquiries/cancellations" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
                    Cancelled
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isOffersOpen} onOpenChange={setIsOffersOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton onClick={() => setIsOffersOpen(!isOffersOpen)} className="cursor-pointer">
                <Tags className="mr-2 h-4 w-4" />
                Offers
                {isOffersOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>
          <CollapsibleContent>
            <div className="relative ml-6 mt-2 pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gray-300">
              <SidebarMenuItem>
                <Link href="/offers/domestic">
                  <SidebarMenuButton className={`cursor-pointer ${ pathname === "/offers/domestic" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
                    Domestic
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
              <Link href="/offers/international">
                <SidebarMenuButton className={`cursor-pointer ${ pathname === "/offers/international" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
                  International
                </SidebarMenuButton>
              </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/offers/cancellations">
                  <SidebarMenuButton className={`cursor-pointer ${ pathname === "/offers/cancellations" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
                    Cancelled
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <SidebarMenuItem>
          <Link href="/users">
            <SidebarMenuButton className={`cursor-pointer ${ pathname === "/users" ? "font-[500] text-black" : "font-normal text-[#817f81]"}`}>
              <User className="mr-2 h-4 w-4" />
              Users
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </nav>
  )
}

