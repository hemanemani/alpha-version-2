"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Upload,  Edit,ArrowUp, ArrowDown, Move, Ban  } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios";
import AlertMessages from "@/components/AlertMessages";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel,getSortedRowModel,SortingState } from "@tanstack/react-table";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { File, FileText, Clipboard, FileSpreadsheet } from "lucide-react"
import { DataTablePagination } from "@/components/data-table-pagination"
import { SkeletonCard } from "@/components/SkeletonCard"
import { OrderItem } from "@/types/order"
import axios from "axios"

interface UpdateResponse {
  success: boolean;
  message: string;
}

interface BlockResponse {
  success: boolean;
  error?: string;
}

const CancellationDomesticOrdersDashboard:React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(true);
  

  const router = useRouter();
  

 useEffect(() => {
     const fetchOfferCancellationData = async () => {
       // setLoading(true); 
     const token = localStorage.getItem("authToken");
     if (!token) {
       console.log("User is not authenticated.");
       // setLoading(false);
       return;
     }
 
     try {
       const response = await axiosInstance.get<OrderItem[]>('/order-domestic-cancellations', {
         headers: { Authorization: `Bearer ${token}` },
       });
       if (response && response.data) {
         const processedData = response.data.map((item) => ({
           ...item,
           // addedBy: item.user?.name || 'Unknown',
           
         }));
         setOrders(processedData);
         setFilteredData(response.data);
       } else {
         console.error('Failed to fetch orders', response.status);
       }
     } catch (error) {
       console.error('Error fetching orders:', error);
     } finally {
       setIsLoading(false);
     }
   }
       
   fetchOfferCancellationData();
   }, []);

 
   const handleUpdateStatus = async (id: number, status: number, offers_status:number, orders_status: number 
   ): Promise<void> => {
     try {
       const token = localStorage.getItem("authToken");
   
       if (!token) {
         console.log("User is not authenticated.");
         return;
       }
   
       const response = await axiosInstance.patch<UpdateResponse>(`/inquiries/${id}/update-inquiry-status`, 
         { status, offers_status, orders_status },
         { headers: { Authorization: `Bearer ${token}` } }
       );
   
       if (response.data.success) {
         setAlertMessage("Moved to Cancel");
         setIsSuccess(true);
         setFilteredData((prevFilteredData) => prevFilteredData.filter((row) => row.id !== id));  
         // console.log(response.data.message);
       }
     } catch (error) {
       setAlertMessage("Failed to move to Cancel...");
       setIsSuccess(false);
       console.error("Error updating status:", error);
     }
   };
   

  
 

  const handleEdit = (id: number) => {
    router.push(`/orders/domestic/edit/${id}`);
  };

  const handleOrders = (id: number) => handleUpdateStatus(id, 1, 1 , 2);


  const handleBlockOrder = async (id: number, mobile_number: string, 
  ): Promise<void> =>  {
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      const response = await axiosInstance.post<BlockResponse>(`/block-order/${id}`, { mobile_number },
        { headers: 
          { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setAlertMessage("Order Blocked Successfully");
        setIsSuccess(true);
        setFilteredData((prevFilteredData) => prevFilteredData.filter((row) => row.id !== id)); 
        // alert('Blocked successfully')
    }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAlertMessage("Duplicate Entry");
        setIsSuccess(false);
        alert(error.response?.data?.error || "Duplicate Entry");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred.");
      }
      console.error("Error blocking inquiry:", error);
    }
  

  };


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
  
    if (!value) {
      setFilteredData(orders); // Restore full data when search is cleared
      return;
    }
  
    const filtered = orders.filter((row) =>
      Object.values(row).some(
        (field) => field && String(field).toLowerCase().includes(value) // Check if field is not null
      )
    );
  
    setFilteredData(filtered);
  };

  const columns: ColumnDef<OrderItem>[] = [
    {
      accessorFn: (row) => row.offers?.[0].order?.order_number ?? "-",
      id: "orderNumber",
      header: "Order Number",
    },
    {
      accessorFn: (row) => row.name,
      id: "name",
      header: "Name",
    },
    {
      accessorFn: (row) => row.mobile_number ?? "-", 
      id: "contactNumber",
      header: "Contact Number",
      
    },
    {
      accessorFn: (row) => {
        const sellerAddress = row?.offers?.[0]?.order?.sellers && Array.isArray(row.offers[0].order.sellers) && row.offers[0].order.sellers.length > 0
          ? row.offers[0].order.sellers[0].seller_address
          : "-";
        return sellerAddress;
      },
      id: "sellerAddress",
      header: "Address",
    },      
    {
      accessorFn: (row) => {
      const productName = row.offers?.[0].order?.sellers && Array.isArray(row.offers[0].order.sellers) && row.offers[0].order.sellers.length > 0 
          ? row.offers[0].order.sellers[0].product_name 
          : "-"; 
        return productName;
      },
      id: "productName",
      header: "Products",
      
    },
    {
      accessorFn: (row) => {
        const sellerName = row.offers?.[0].order?.sellers && Array.isArray(row.offers[0].order.sellers) && row.offers[0].order.sellers.length > 0 
        ? row.offers[0].order.sellers[0].seller_name 
            : "-"; 
          return sellerName;
        },
      id: "sellerName",
      header: "Seller Name",
      
    },
    {
      accessorFn: (row) => row.offers?.[0].order?.total_amount ?? "-", 
      id: "orderAmount",
      header: "Order Amount",
      
    },
    {
      id: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {

        const date = row.original.offers?.[0].order?.amount_received_date;
        const isReceived = !!date;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isReceived ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isReceived ? 'Received' : 'Not Received'}
          </span>
        );
      },
    },
    {
      id: "orderStatus",
      header: "Order Status",
      cell: ({ row }) => {

        const offer = row.original.offers?.[0];
        const dispatchDate = offer?.sample_dispatched_date;
        const deliveryDate = offer?.sample_received_date;
        let statusText = "Pending";
        let bgClass = "bg-yellow-100 text-yellow-800";

        if (dispatchDate) {
          if (deliveryDate) {
            statusText = "Delivered";
            bgClass = "bg-green-100 text-green-800";
          } else {
            statusText = "Dispatched";
            bgClass = "bg-orange-100 text-orange-800";
          }
        }
    
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgClass}`}>
            {statusText}
          </span>
        );
    
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
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer border-b border-b-[#d9d9d9] rounded-none py-2" onClick={() => handleEdit(row.original.offers![0]!.order!.id)}>
                <Edit className="h-4 w-4 text-black" /> Edit Order
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={() => handleOrders(row.original.id)}>
                <Move className="h-4 w-4 text-gray-600" /> Move back to Orders
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={() => handleBlockOrder(row.original.id,row.original.mobile_number)}>
                <Ban className="h-4 w-4 text-gray-600" /> Block
              </DropdownMenuItem>
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
  
    const exportToCSV = () => {
      const worksheet = utils.json_to_sheet(orders);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Orders");
      writeFile(workbook, "orders.csv");
    };
  
    const exportToExcel = () => {
      const worksheet = utils.json_to_sheet(orders);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Orders");
      writeFile(workbook, "orders.xlsx");
    };

    
  
    const exportToPDF = () => {
      const doc = new jsPDF();
    
      autoTable(doc, {
        head: [
          columns.map((col) => col.header as string)
        ],
        body: orders.map((order) =>
          columns.map((col) => {
            const value = order[col.id as keyof OrderItem];
    
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value);
            }
    
            return value ?? '';
          })
        ),
      });
    
      doc.save("orders.pdf");
    };
    
    
    
  
    const exportToClipboard = () => {
      const text = orders
        .map((row) => columns.map((col) => row[col.id as keyof OrderItem]).join("\t"))
        .join("\n");
      navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard"));
    };
    
  
  


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <a href="/analytics" className="text-black underline underline-offset-2 font-inter-semibold text-[14px]">
            View Analytics
          </a>
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold">
              <Upload className="w-4 h-4 text-[13px]" />
              Export 
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white border border-[#d9d9d9] rounded-lg">
            <DropdownMenuItem
              className="flex items-center gap-2 text-sm font-inter-semibold text-black cursor-pointer py-2 border-b border-b-[#d9d9d9] rounded-none"
              onClick={exportToClipboard}
            >
              <Clipboard className="h-4 w-4 text-black" /> Copy Data
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-sm font-inter-semibold text-black cursor-pointer py-2 border-b border-b-[#d9d9d9] rounded-none"
              onClick={exportToExcel}
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export Excel
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2 text-sm font-inter-semibold text-black cursor-pointer py-2 border-b border-b-[#d9d9d9] rounded-none"
              onClick={exportToCSV}
            >
              <FileText className="h-4 w-4 text-blue-600" /> Export CSV
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2"
              onClick={exportToPDF}
            >
              <File className="h-4 w-4 text-red-600" /> Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        
      </div>

      <div className="flex justify-end items-center mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
          <Input
            className="w-64 bg-white font-inter-light"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {orders.length}</span>
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
        <div>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
        </div>
    </div>
  )
}

export default CancellationDomesticOrdersDashboard;

