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
import moment from "moment"
import { useAuth } from "@/lib/AuthContext"
import { Button } from "@/components/ui/button"
import { usePermission } from "@/lib/usePermission"

interface AdData{
    id: number;
    ad_title:string;
    date_published: string | null;
    platform: string;
    goal: string;
    audience: string;
    views: string;
    reach: string;
    messages_received: string;
    total_amount_spend: string;
    duration : string;
  }



const AdsDashboardInternational:React.FC = () => {
  const [ads, setAds] = useState<AdData[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<AdData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { accessLevel } = useAuth();
  const { hasAccessTo } = usePermission();
  

  const router = useRouter();

    const formatDate = (dateString: string | null): string => {
      return dateString ? moment(dateString).format('DD-MM-YYYY') : '-';
    };
  

  const handleEdit = (id: number) => {
    router.push(`/ads/international/edit/${id}`);
  };

  useEffect(() => {
    const fetchAds = async () => {
      // setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      // setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<{ message: string; data: AdData[] }>('/international-ads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.data && Array.isArray(response.data.data)) {
        setAds(response.data.data);
        setFilteredData(response.data.data);
      } else {
        console.error('Failed to fetch ads', response.status);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  }
      
    fetchAds();
  }, []);


  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this ad?")) {
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.error("No auth token found.");
        return;
      }
  
      await axiosInstance.delete(`/international-ad-data/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertMessage("Ad deleted successfully");
      setIsSuccess(true);
      setAds((prevAds) => prevAds.filter((ad) => ad.id !== id));
  
      setTimeout(() => {
        window.location.reload();
      }, 500);
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAlertMessage("Failed to delete...");
        setIsSuccess(false);  
        console.error("Delete error:", error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Failed to delete ad. Please try again.");
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
        setFilteredData(ads); // Restore full data when search is cleared
        return;
      }
    
      const filtered = ads.filter((row) =>
        Object.values(row).some(
          (field) => field && String(field).toLowerCase().includes(value) // Check if field is not null
        )
      );
    
      setFilteredData(filtered);
    };

    const columns: ColumnDef<AdData>[] = [
      {
        accessorFn: (row) => row.ad_title,
        id: "adTitle",
        header: "Title",
      },
     
      {
        accessorFn: (row) => row.platform,
        id: "platform",
        header: "Platform",
      },
      {
        accessorFn: (row) => formatDate(row.date_published),
        id: "datePublished",
        header: "Date Published",
      },
      {
        accessorFn: (row) => row.views,
        id: "views",
        header: "Views",
      },
      {
        accessorFn: (row) => row.reach,
        id: "reach",
        header: "Reach",
      },
      {
        accessorFn: (row) => row.goal,
        id: "goal",
        header: "Goal",
      },
      {
        accessorFn: (row) => row.messages_received,
        id: "results",
        header: "Results",
      },
      {
        accessorFn: (row) => row.duration,
        id: "duration",
        header: "Duration",
      },
      {
        accessorFn: (row) => row.total_amount_spend,
        id: "totalAmountSpend",
        header: "Amount Spent",
      },
      {
        accessorFn: (row) => {
          const audience = row.audience;
          if (Array.isArray(audience)) {
            return audience.join(', ');
          }
          try {
            const parsed = JSON.parse(audience);
            return Array.isArray(parsed) ? parsed.join(', ') : audience;
          } catch {
            return audience;
          }
        },
        id: "audience",
        header: "Audience",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => 
        {
          return(
          (accessLevel === "master") && (

          <DropdownMenu open={openId === row.original.id} onOpenChange={(isOpen) => setOpenId(isOpen ? row.original.id : null)}>
            <DropdownMenuTrigger asChild>
              <MoreHorizontal className="w-8 h-8 bg-[#d9d9d9] dark:bg-[#2C2D2F] dark:text-[#fff] rounded-full p-1 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-[#111111] border border-[#d9d9d9] dark:border-[#2e2e2e] rounded-lg">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer border-b border-b-[#d9d9d9] dark:border-b-[#2e2e2e] rounded-sm py-2 dark:hover:bg-[#2C2D2F]" onClick={() => handleEdit(row.original.id)}>
                <Edit className="h-4 w-4 text-gray-600 dark:text-white" /> Edit Ad
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 dark:text-white cursor-pointer py-2 dark:hover:bg-[#2C2D2F]" onClick={() => handleDelete(row.original.id)}>
                <Ban className="h-4 w-4 text-gray-600 dark:text-white" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          ))
        },
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
        
        
        <div className="flex justify-end items-center mb-4 gap-4">
            <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
            <Input
                className="w-64 bg-white dark:bg-[#2C2D2F] font-inter-light"
                placeholder="Search ads..."
                value={searchQuery}
                onChange={handleSearch}
            />
            </div>
            {(accessLevel === "master" && hasAccessTo("/ads/upload")) && (
                <Link href="/ads/upload">
                  <Button className="bg-transparent text-black dark:text-white rounded-small text-[11px] px-2 py-1 capitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold">
                    + Bulk Upload
                  </Button>
                </Link>
              )}
            <Link href="/ads/create">
                <RainbowButton className="bg-black dark:bg-white dark:text-black text-white text-[11px] captitalize px-2 py-1 h-[37px] cursor-pointer font-inter-semibold">+ Add New Ad</RainbowButton>
            </Link>
        </div>

      

        <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {ads.length}</span>
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
                  <SelectItem key={size} value={size.toString()} className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      <div className="bg-transparent rounded-lg border-2 border-[#d9d9d9] dark:border-[#2e2e2e] dark:hover:rounded-lg">
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

export default AdsDashboardInternational;

