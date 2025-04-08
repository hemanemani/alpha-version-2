"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Edit, Ban,ArrowUp, ArrowDown  } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios";
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import AlertMessages from "@/components/AlertMessages";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel,getSortedRowModel,SortingState } from "@tanstack/react-table";
import { RainbowButton } from "@/components/RainbowButton"
import { DataTablePagination } from "@/components/data-table-pagination"
import { SkeletonCard } from "@/components/SkeletonCard"

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
  // const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [toggleStates, setToggleStates] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);


  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/users/edit/${id}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      // setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      // setLoading(false);
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
      setIsLoading(false);
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
              {isAdmin === 1 ? "Master Admin" : isAdmin === 2 ? "Admin" : "Admin Assistant"}
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
            onCheckedChange={() => handleToggle(row.original.id)}
            disabled={row.original.id === 1} 
            />
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
              {(row.original.id) === 1 ? '' :
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={() => handleDelete(row.original.id)}>
                <Ban className="h-4 w-4 text-gray-600" /> Delete
              </DropdownMenuItem> }
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];

    const table = useReactTable({
      data: filteredData,
      columns,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      state: {
        sorting,
      },  
      initialState: { pagination: { pageSize,pageIndex:0 } }, 
    });
    
  

  return (
    <div>
        <div className="ml-[85px] -mt-[30px] mb-[20px]">
          <p className="text-[28px] text-[#000] mt-[5px] font-inter-bold">{users.length}</p>
        </div>
        
        <div className="flex justify-end items-center mb-4 gap-4">
            <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
            <Input
                className="w-64 bg-white font-inter-light"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
            />
            </div>
            <Link href="/users/create">
                <RainbowButton className="bg-black text-white text-[11px] captitalize px-2 py-1 h-[37px] cursor-pointer font-inter-semibold">+ Add New User</RainbowButton>
            </Link>
        </div>

      

        <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {users.length}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                table.setPageSize(Number(value))
              }}
              defaultValue="10"
            >
              <SelectTrigger className="w-[60px] h-[25px] text-[13px] p-2 font-inter-semibold cursor-pointer">                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 15, 20, 25].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="cursor-pointer">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      <div className="bg-transparent rounded-lg border-2 border-[#d9d9d9]">
      {/* {loading ? (
        <p>Loading...</p>
      ) : ( */}
        <Table>
          <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none py-4 font-inter-medium"
                      >
                        <div className="flex flex-col gap-1 justify-center">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {header.column.getCanSort() && (
                          <span className="mt-1">
                           {isSorted === "asc" && <ArrowUp className="w-3 h-3" />}
                           {isSorted === "desc" && <ArrowDown className="w-3 h-3" />}
                          </span>
                          
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          <TableBody className="font-inter-medium">
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
                  {isLoading && <SkeletonCard height="h-[64px]" />}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      {/* )} */}
      </div>
        <div className="mt-6">
          <DataTablePagination table={table} />
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

