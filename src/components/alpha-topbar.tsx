"use client"


import React, { JSX,useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, UserCircle,LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation"
import { DarkMode } from "./dark-mode";

interface User {
  id: number;
  name: string;
  email: string;
  user_name: string;
}


interface TopBarProps {
  drawerWidth: number;
  user: User | null;

}

const AlphaTopBar: React.FC<TopBarProps> = ({ drawerWidth,user }) => {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const currentPage = useMemo(() => {

  const pageTitles: Record<string, JSX.Element> = {
    "/dashboard": (
      <div>
        <h1 className="text-[22px] text-[#7f7f7f] font-inter-semibold">Hello <span className="text-[#000] dark:text-white font-inter-semibold">{user?.name}</span></h1>
        <p className="text-[14px] text-[#7f7f7f] font-inter-light mt-1">Welcome to Alpha, your one stop admin solutions</p>
      </div>
    ),
    "/analytics": (
      <div>
        <h1 className="text-[22px] text-[#000] dark:text-white font-inter-semibold">Analytics </h1>
        <p className="text-[14px] text-[#7f7f7f] font-inter-light mt-1">Monitor every activity of performance</p>
      </div>
    ),
    "/inquiries/domestic" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Domestic Inquiries</span>
    ),
    "/inquiries/domestic/upload" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Bulk Upload Domestic Inquiries</span>
    ),
    "/inquiries/international/upload" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Bulk Upload International Inquiries</span>
    ),
    "/inquiries/domestic/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Add New Domestic Inquiry</span>
    ),
    "/inquiries/international" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All International Inquiries</span>
    ),
    "/inquiries/international/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Add New International Inquiry</span>
    ),
    "/inquiries/cancellations" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Cancelled Inquiries</span>
    ),
    "/offers/domestic" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Domestic Offers</span>
    ),
    "/offers/international" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All International Offers</span>
    ),
    "/offers/cancellations" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Cancelled Offers</span>
    ),
    "/orders/domestic" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Domestic Orders</span>
    ),
    "/orders/international" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All International Orders</span>
    ),
    "/orders/domestic/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Add New Domestic Order</span>
    ),
    "/orders/international/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Add New International Order</span>
    ),
    "/orders/cancellations" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Cancelled Orders</span>
    ),
    "/sellers/index" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Sellers</span>
    ),
    "/sellers/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Create New Seller</span>
    ),
    "/sellers/upload" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Upload Seller</span>
    ),
    "/sellers/products" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Products</span>
    ),
    "/ads" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">All Ads</span>
    ),
    "/ads/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Add New Ad</span>
    ),
    "/users/create" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Add New User</span>
    ),
    "/ads/upload" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Upload Ad</span>
    ),
    "/users" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold">Users Management
      </span>
      
    ),
    "/unauthorized" :(
      <span className="text-[#000] dark:text-white text-[22px] font-inter-semibold"></span>
      
    ),
  };

  if (pathname.startsWith("/inquiries/domestic/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit Inquiry</span>;
  }
  if (pathname.startsWith("/inquiries/international/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit International Inquiry</span>;
  }
  if (pathname.startsWith("/orders/domestic/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit Order</span>;
  }
  if (pathname.startsWith("/orders/international/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit International Order</span>;
  }
  if (pathname.startsWith("/ads/domestic/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit Domestic Ad</span>;
  }
  if (pathname.startsWith("/ads/international/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit International Ad</span>;
  }
  if (pathname.startsWith("/users/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit User</span>;
  }
  if (pathname.startsWith("/sellers/edit")) {
    return <span className="text-black dark:text-white text-[22px] font-inter-semibold">Edit Seller</span>;
  }

  

  return pageTitles[pathname] || "Dashboard";

}, [pathname,user?.name]);

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
    className="absolute top-5 left-0 w-full transition-all z-50 pr-8 pl-3 flex items-center justify-between"
    style={{ width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth }}
  >
    <Button variant="ghost" size="icon" className="sm:hidden">
      <Menu className="w-6 h-6" />
    </Button>
    <div>{currentPage}</div>
    <div className="flex justify-end items-end gap-2">
      <div className=" dark:bg-[#111] bg-white mr-2 rounded-lg">
        <DarkMode />
      </div>  
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="w-8 h-8">
              <UserCircle className="cursor-pointer" />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="dark:bg-[#111]">
          <DropdownMenuItem className="cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]" onClick={handleLogout}>
            <LogOut className="w-4 h-4 text-black dark:text-white stroke-3" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    
  </div>
);

};

export default AlphaTopBar;
