"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Edit, Ban  } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios";
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import AlertMessages from "@/components/AlertMessages";


interface User{
  id: number;
  name: string;
  role: string;
  status: string;
  access: string;
  [key: string]: string | number | null | undefined;
}




const UsersDashboard:React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  

  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/users/edit/${id}`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
    const filtered = users.filter((row) =>
      Object.values(row).some(
        (field) => (field ? String(field).toLowerCase().includes(value) : false)
      )      
    );
    setFilteredData(filtered);
  };

  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<User[]>('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.data) {
        const processedData = response.data.map((item) => ({
          ...item,
          // addedBy: item.user?.name || 'Unknown',
          
        }));
        setUsers(processedData);
        setFilteredData(response.data);
      } else {
        console.error('Failed to fetch users', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }
      
    fetchUsers();
  }, []);

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.error("No auth token found.");
        return;
      }
  
      await axiosInstance.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertMessage("User deleted successfully");
      setIsSuccess(true);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      // alert("User deleted successfully!");
  
      setTimeout(() => {
        window.location.reload();
      }, 500);
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAlertMessage("Failed to delete...");
        setIsSuccess(false);  
        console.error("Delete error:", error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Failed to delete user. Please try again.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    }
  };
  

  return (
    <div>
        <div className="flex justify-end items-center mb-4 gap-4">
            <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
            <Input
                className="w-64 bg-white"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
            />
            </div>
            <Link href="/users/create">
                <Button className="bg-black text-white rounded-small text-[11px] captitalize px-2 py-1 cursor-pointer">+ Add New User</Button>
            </Link>
        </div>

      

        <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px]">Total: {users.length}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#7f7f7f] text-[13px] font-[500]">Rows per page:</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-[65px] h-[25px] text-[13px] font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      <div className="bg-transparent rounded-lg border-2 border-[#d9d9d9]">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer py-6">
                Name
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Role
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Access
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((user) => (
              <TableRow key={user.id}>                
                <TableCell className="text-[14px] font-[500] text-black py-4">{user.name}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{user.is_admin}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{user.access_level}</TableCell>
                <TableCell>
                    <Switch checked={Boolean(user.status)} />
                    <span className="ml-2">{user.status ? "Active" : "Inactive"}</span>
                </TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <DropdownMenu open={openId === user.id} onOpenChange={(isOpen) => setOpenId(isOpen ? user.id : null)}>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                        <MoreHorizontal className="w-8 h-8 bg-[#d9d9d9] rounded-full p-1" />
                    </DropdownMenuTrigger>                 
                    <DropdownMenuContent align="end" className="w-52 bg-white border border-[#d9d9d9] rounded-lg" forceMount>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer py-2"
                       onClick={()=>handleEdit(user.id)}>
                        <Edit className="h-4 w-4 text-gray-600" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer py-2" onClick={() => handleDelete(user.id)}>
                        <Ban className="h-4 w-4 text-gray-600" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      </div>
      <div className="p-4 text-[#7f7f7f] text-[13px] font-[500]">
          Showing: {users.length} of {users.length}
        </div>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}


    </div>
  )
}

export default UsersDashboard;

