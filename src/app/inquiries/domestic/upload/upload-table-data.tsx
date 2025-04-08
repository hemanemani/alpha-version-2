"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FolderOpen,ArrowUp, ArrowDown  } from "lucide-react"
import axiosInstance from "@/lib/axios"
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel,getSortedRowModel,SortingState } from "@tanstack/react-table";
import { format } from "date-fns"
import { DataTablePagination } from "@/components/data-table-pagination"
import { SkeletonCard } from "@/components/SkeletonCard"

interface User {
  id: number;
  name: string;
}

interface UploadItem {
  id: number;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: number;
  status: string;
  user?: User;
  uploaded_by_name?: string;
  file_path:string;
  }
    
  

interface UploadProps {
    uploadsData: UploadItem[]
    // setUploadsData: React.Dispatch<React.SetStateAction<UploadItem[]>>
    filteredData: UploadItem[]
    isLoading:boolean
    setFilteredData: React.Dispatch<React.SetStateAction<UploadItem[]>>
  }
  


const DomesticUploadData:React.FC<UploadProps> = ({uploadsData,filteredData,setFilteredData,isLoading}) => {
  // const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  
    
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
    const filtered = uploadsData.filter((row) =>
      Object.values(row).some(
        (field) => (field ? String(field).toLowerCase().includes(value) : false)
      )      
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (uploadsData.length > 0) {
      // setLoading(false)
    }
  }, [uploadsData])

  const handleDownload = (filePath: string | number | null | undefined) => {
    if (!filePath) {
      console.error("File path is missing.");
      return;
    }
  
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ogaenik.com";
    const fullPath = `${baseUrl}/${filePath}`;
  
    window.open(fullPath, "_blank");
  };
  

  const handleDelete = async(id: number) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        console.log("User is not authenticated.");
        return;
    }

    try {
        const response = await axiosInstance.delete(`/bulk-domestic-data/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            console.log("Item deleted successfully.");
            setFilteredData((prevFilteredData) => prevFilteredData.filter((row) => row.id !== id));  
        } else {
            console.error("Failed to delete item:", response.status);
        }
    } catch (error) {
        console.error("Error deleting item:", error);
    }

  };

  const columns: ColumnDef<UploadItem>[] = [
    {
      accessorFn: (row) => row.file_name,
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            {/* File Icon */}
            <div className="flex items-center justify-center w-10 h-10">
              <FolderOpen className="text-gray-600 w-5 h-5" />
            </div>

            {/* File Info */}
            <div>
              <p className="text-black font-medium">{row.original.file_name}</p>
              <p className="text-[13px] text-gray-500">{(row.original.file_size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => row.uploaded_at,
      id: "uploaded_at",
      header: "Date Uploaded",
      cell: ({ row }) => (
        <span>{format(new Date(row.original.uploaded_at), "dd MMM yyyy, hh:mm a")}</span>
      ),
    },
    {
      accessorFn: (row) => row.uploaded_by_name,
      id: "uploaded_by",
      header: "Uploaded By",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <>
        <Button
            variant="outline"
            className="bg-transparent text-black rounded-md text-[12px] capitalize border border-gray-300 cursor-pointer mr-2"
            onClick={()=>handleDelete(row.original.id)}
            >
            Delete
        </Button>
        <Button
            variant="outline"
            className="bg-black text-white rounded-md text-[12px] capitalize border border-gray-300 cursor-pointer hover:bg-black hover:text-white"
            onClick={() => handleDownload(row.original.file_path)}
            >
            Download
        </Button>
        </>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-black font-inter-semibold text-[18px]">
            All Listings
          </p>
          <p className="text-[13px] text-[#848091] font-inter-medium">Files that have been previously uploaded
          </p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
          <Input
            className="w-64 bg-white font-inter-light"
            placeholder="Search for files..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {uploadsData.length}</span>
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
    </div>
  )
}

export default DomesticUploadData;

