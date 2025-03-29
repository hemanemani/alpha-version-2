"use client"


import React, { JSX, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, UserCircle,LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation"
import axios from "axios";


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
  const pathname = usePathname();
  const router = useRouter();
  const [userCount, setUserCount] = useState<number>(0);
  const currentPage = useMemo(() => {

  const pageTitles: Record<string, JSX.Element> = {
    "/dashboard": (
      <div>
        <h1 className="text-[22px] text-[#7f7f7f] font-inter-medium">Hello <span className="text-[#000] text-[22px] font-inter-medium">{user?.name}</span></h1>
        <p className="text-[14px] text-[#7f7f7f] font-inter-light mt-1">Welcome to Alpha, your one stop admin solutions</p>
      </div>
    ),
    "/analytics": (
      <div>
        <h1 className="text-[22px] text-[#000] font-inter-semibold">Analytics </h1>
        <p className="text-[14px] text-[#7f7f7f] font-inter-light mt-1">Monitor every activity of performance</p>
      </div>
    ),
    "/inquiries/domestic" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">All Domestic Inquiries</span>
    ),
    "/inquiries/domestic/upload" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">Bulk Upload Domestic Inquiries</span>
    ),
    "/inquiries/international/upload" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">Bulk Upload International Inquiries</span>
    ),
    "/inquiries/domestic/create" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">Add New Domestic Inquiry</span>
    ),
    "/inquiries/international" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">All International Inquiries</span>
    ),
    "/inquiries/international/create" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">Add New International Inquiry</span>
    ),
    "/inquiries/cancellations" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">All Cancelled Inquiries</span>
    ),
    "/offers/domestic" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">All Domestic Offers</span>
    ),
    "/offers/international" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">All International Offers</span>
    ),
    "/offers/cancellations" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">All Cancelled Offers</span>
    ),
    "/users" :(
      <span className="text-[#000] text-[22px] font-inter-semibold">Users Management
      <p className="text-[28px] text-[#000] mt-[5px] font-[700] text-center"> {userCount} </p>
      </span>
      
    ),
    "/unauthorized" :(
      <span className="text-[#000] text-[22px] font-inter-semibold"></span>
      
    ),
  };

  if (pathname.startsWith("/inquiries/domestic/edit")) {
    return <span className="text-black text-[22px] font-inter-semibold">Edit Inquiry</span>;
  }
  if (pathname.startsWith("/inquiries/international/edit")) {
    return <span className="text-black text-[22px] font-inter-semibold">Edit International Inquiry</span>;
  }
  if (pathname.startsWith("/users/edit")) {
    return <span className="text-black text-[22px] font-inter-semibold">Edit User</span>;
  }

  return pageTitles[pathname] || "Dashboard";

}, [pathname,user?.name,userCount]);

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

useEffect(() => {
  const fetchUsersData = async (): Promise<void> => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.log("User is not authenticated.");
      return;
    }

    try {
      const response = await axiosInstance.get<User[]>("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUserCount(response.data.length);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching users:", error.response?.data?.message || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  fetchUsersData();
}, []);




return (
  <div
    className="absolute top-5 left-0 w-full transition-all z-50 pr-8 pl-3 flex items-center justify-between"
    style={{ width: `calc(100% - ${drawerWidth}px)`, marginLeft: drawerWidth }}
  >
    <Button variant="ghost" size="icon" className="sm:hidden">
      <Menu className="w-6 h-6" />
    </Button>
    <div>{currentPage}</div>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="w-8 h-8">
            <UserCircle className="cursor-pointer" />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <LogOut className="w-4 h-4 text-black stroke-3" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

};

export default AlphaTopBar;
