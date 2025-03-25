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
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel } from "@tanstack/react-table";

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
  const [pageSize, setPageSize] = useState(5);
  const [toggleStates, setToggleStates] = useState<{ [key: number]: number }>({});


  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/users/edit/${id}`);
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
        const initialToggleStates: { [key: number]: number } = {};
          response.data.forEach((user) => {
            initialToggleStates[user.id] = Number(user.status);
          });
          setToggleStates(initialToggleStates);
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

  const handleToggle = async (id: number) => {
    const newState = toggleStates[id] === 1 ? 0 : 1;
    const updatedToggleStates = { ...toggleStates, [id]: newState };
    setToggleStates(updatedToggleStates);
    console.log(updatedToggleStates)
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }

      await axiosInstance.post(
        `/update-status/${id}`,
        { status: newState },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlertMessage("Status updated successfully");
      setIsSuccess(true);
    } catch (error) {
      setAlertMessage("Failed to update user status");
      setIsSuccess(false);
      console.error("Failed to update user status", error);
    }
  };




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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
      const value = event.target.value.toLowerCase();
      setSearchQuery(value);
    
      if (!value) {
        setFilteredData(users); // Restore full data when search is cleared
        return;
      }
    
      const filtered = users.filter((row) =>
        Object.values(row).some(
          (field) => field && String(field).toLowerCase().includes(value) // Check if field is not null
        )
      );
    
      setFilteredData(filtered);
    };

    const columns: ColumnDef<User>[] = [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: "Name",
      },
     
      {
        accessorFn: (row) => row.is_admin,
        id: "is_admin",
        header: "Role",
        cell: ({row})=>{
          const isAdmin = row.original.is_admin;
          return (
            <span className="ml-2">
              {isAdmin === 1 ? "Master Admin" : "Admin"}
            </span>
          );
      
        }
      },
      {
        accessorFn: (row) => row.access_level,
        id: "access_level",
        header: "Access",
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          return(
            <>
            
            <Switch
            className="cursor-pointer"                      
            checked={toggleStates[row.original.id] === 1}
            onCheckedChange={() => handleToggle(row.original.id)} />
            <span className="ml-2">{row.original.id ? "Active" : "Inactive"}</span>
            </>
          )

        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu open={openId === row.original.id} onOpenChange={(isOpen) => setOpenId(isOpen ? row.original.id : null)}>
            <DropdownMenuTrigger asChild>
              <MoreHorizontal className="w-8 h-8 bg-[#d9d9d9] rounded-full p-1 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-white border border-[#d9d9d9] rounded-lg">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer border-b border-b-[#d9d9d9] rounded-none py-2" onClick={() => handleEdit(row.original.id)}>
                <Edit className="h-4 w-4 text-black" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer py-2" onClick={() => handleDelete(row.original.id)}>
                <Ban className="h-4 w-4 text-gray-600" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize,pageIndex:0 } }, 
      });
    
  

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
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                table.setPageSize(Number(value))
              }}
              defaultValue="5"
            >
              <SelectTrigger className="w-[65px] h-[25px] text-[13px] font-bold">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5,10, 15, 20, 25].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-4">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      </div>
        <div className="p-4 text-[#7f7f7f] text-[13px] font-[500] flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
        <div>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
        </div>
    </div>
  )
}

export default UsersDashboard;

