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
import axios from "axios"
import AlertMessages from "@/components/AlertMessages";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel,getSortedRowModel,SortingState } from "@tanstack/react-table";
import { RainbowButton } from "@/components/RainbowButton"
import { DataTablePagination } from "@/components/data-table-pagination"
import { SkeletonCard } from "@/components/SkeletonCard"
import { useAuth } from "@/lib/AuthContext";
import { usePermission } from "@/lib/usePermission"

interface Seller{
  id: number;
  name: string;
  company_name: string;
  mobile_number: string;
  email: string;
  status:string
  [key: string]: string | number | null | undefined;
}




const SellersDashboard:React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { accessLevel } = useAuth();
  const { hasAccessTo } = usePermission();


  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/sellers/edit/${id}`);
  };

  useEffect(() => {
    const fetchSellers = async () => {
      // setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("Seller is not authenticated.");
      // setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<Seller[]>('/sellers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.data) {
        const processedData = response.data.map((item) => ({
          ...item,          
        }));
        setSellers(processedData);
        setFilteredData(response.data);
      } else {
        console.error('Failed to fetch sellers', response.status);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setIsLoading(false);
    }
  }
      
  fetchSellers();
  }, []);



  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this seller?")) {
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.error("No auth token found.");
        return;
      }
  
      await axiosInstance.delete(`/sellers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertMessage("Seller deleted successfully");
      setIsSuccess(true);
      setSellers((prevSellers) => prevSellers.filter((seller) => seller.id !== id));
  
      setTimeout(() => {
        window.location.reload();
      }, 500);
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAlertMessage("Failed to delete...");
        setIsSuccess(false);  
        console.error("Delete error:", error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Failed to delete seller. Please try again.");
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
        setFilteredData(sellers); // Restore full data when search is cleared
        return;
      }
    
      const filtered = sellers.filter((row) =>
        Object.values(row).some(
          (field) => field && String(field).toLowerCase().includes(value) // Check if field is not null
        )
      );
    
      setFilteredData(filtered);
    };

    const columns: ColumnDef<Seller>[] = [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: "Seller Name",
      },
      {
        accessorFn: (row) => row.company_name || '-',
        id: "company_name",
        header: "Company Name",
      },
      {
        accessorFn: (row) => row.mobile_number,
        id: "mobile_number",
        header: "Contact Number",
      },
      {
        accessorFn: (row) => row.email || '-',
        id: "email",
        header: "Email",
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();
          let bgColor = "";
          switch (status) {
            case "best":
              bgColor = "bg-green-100 text-green-800"
              break;
            case "average":
              bgColor = "bg-orange-100 text-orange-800"
              break;
            case "worst":
              bgColor = "bg-red-100 text-red-800";
              break;
            default:
              bgColor = "bg-gray-100 text-gray-800";
              break;
          }
          return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
              {status || "-"}
            </span>
          );      
        },
      },
      
     
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
        (accessLevel == "full" || accessLevel == "limited") && (
          <DropdownMenu open={openId === row.original.id} onOpenChange={(isOpen) => setOpenId(isOpen ? row.original.id : null)}>
            <DropdownMenuTrigger asChild>
              <MoreHorizontal className="w-8 h-8 bg-[#d9d9d9] rounded-full p-1 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-white border border-[#d9d9d9] rounded-lg">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer border-b border-b-[#d9d9d9] rounded-none py-2" onClick={() => handleEdit(row.original.id)}>
                <Edit className="h-4 w-4 text-black" /> Edit Seller
              </DropdownMenuItem>
              {accessLevel === "full" && (
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={() => handleDelete(row.original.id)}>
                <Ban className="h-4 w-4 text-gray-600" /> Delete
              </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
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
        <div className="ml-[20px] -mt-[30px] mb-[20px]">
          {isLoading ? <SkeletonCard height="h-[40px]" className="w-[40px]" />
          :
          <p className="text-[28px] text-[#000] mt-[5px] font-inter-bold">{sellers.length}</p>
          }
        </div>
        
        <div className="flex justify-end items-center mb-4 gap-4">
            <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
            <Input
                className="w-64 bg-white font-inter-light"
                placeholder="Search seller..."
                value={searchQuery}
                onChange={handleSearch}
            />
            </div>
            {hasAccessTo("/sellers/create") && (
            <Link href="/sellers/create">
                <RainbowButton className="bg-black text-white text-[11px] captitalize px-2 py-1 h-[37px] cursor-pointer font-inter-semibold">+ Add New Seller</RainbowButton>
            </Link>
            )
            }
        </div>

      

        <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {sellers.length}</span>
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
                  <SelectItem key={size} value={size.toString()} className="text-[13px] cursor-pointer">
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
                        <div className="flex flex-col items-center gap-1 justify-center relative float-start">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {header.column.getCanSort() && (
                          <span className="absolute -bottom-3">
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

export default SellersDashboard;

