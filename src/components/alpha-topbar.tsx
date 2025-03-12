"use client"


import React, { JSX, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation"


interface TopBarProps {
  drawerWidth: number;
}

const AlphaTopBar: React.FC<TopBarProps> = ({ drawerWidth }) => {
  const pathname = usePathname();
  const router = useRouter();
  

  const currentPage = useMemo(() => {

  const pageTitles: Record<string, JSX.Element> = {
    "/dashboard": (
      <div>
        <h1 className="text-[22px] text-[#7f7f7f]">Hello <span className="text-[#000] text-[22px]">Admin</span></h1>
        <p className="text-[14px] text-[#7f7f7f] font-inter-light mt-1">Welcome to Alpha, your one stop admin solutions</p>
      </div>
    ),
    "/inquiries/domestic" :(
      <span className="text-[#000] text-[22px] font-[500]">All Domestic Inquiries</span>
    ),
    "/inquiries/domestic/create" :(
      <span className="text-[#000] text-[22px] font-[500]">Add New Domestic Inquiry</span>
    ),
    "/inquiries/international" :(
      <span className="text-[#000] text-[22px] font-[500]">All International Inquiries</span>
    ),
    "/inquiries/international/create" :(
      <span className="text-[#000] text-[22px] font-[500]">Add New International Inquiry</span>
    ),
    "/inquiries/cancellations" :(
      <span className="text-[#000] text-[22px] font-[500]">All Cancelled Inquiries</span>
    ),
    "/offers/domestic" :(
      <span className="text-[#000] text-[22px] font-[500]">All Domestic Offers</span>
    ),
    "/offers/international" :(
      <span className="text-[#000] text-[22px] font-[500]">All International Offers</span>
    ),
    "/offers/cancellations" :(
      <span className="text-[#000] text-[22px] font-[500]">All Cancelled Offers</span>
    ),
  };

  if (pathname.startsWith("/inquiries/domestic/edit")) {
    return <span className="text-black text-[22px] font-[500]">Edit Inquiry</span>;
  }
  if (pathname.startsWith("/inquiries/international/edit")) {
    return <span className="text-black text-[22px] font-[500]">Edit International Inquiry</span>;
  }

  return pageTitles[pathname] || "Dashboard";

}, [pathname]);

const handleLogout = async () => {
  try {
    const response = await axiosInstance.post('/logout', {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (response.status === 200) {
      console.log('Logout successful');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/');
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Logout failed', error);
  }
};



return (
  <div
    className="absolute top-5 left-0 w-full transition-all z-50 px-8 flex items-center justify-between"
    style={{ width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth }}
  >
    <Button variant="ghost" size="icon" className="sm:hidden">
      <Menu className="w-6 h-6" />
    </Button>
    <div>{currentPage}</div>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            <UserCircle className="cursor-pointer" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

};

export default AlphaTopBar;
