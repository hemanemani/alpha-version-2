"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Upload, Move, Ban, Edit  } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios";
import moment from "moment"
import AlertMessages from "@/components/AlertMessages";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel } from "@tanstack/react-table";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { File, FileText, Clipboard, FileSpreadsheet } from "lucide-react"

interface Inquiry{
  id: number;
  inquiry_number: number;
  inquiry_date: string;
  specific_product: string;
  product_categories: string;
  name?: string;
  location: string;
  first_contact_date: string | null;
  second_contact_date: string | null;
  third_contact_date: string | null;
  notes: string;
  [key: string]: string | number | null | undefined;
}

interface UpdateResponse {
  success: boolean;
  message: string;
}




const TruncatedCell = ({ content, limit = 10 }: { content: string; limit?: number }) => {
  if (!content) return <span className="text-muted-foreground">-</span>

  const shouldTruncate = content.length > limit
  const displayContent = shouldTruncate ? `${content.slice(0, limit)}...` : content
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{displayContent}</span>
        </TooltipTrigger>
        {shouldTruncate && (
          <TooltipContent>
            <p>{content}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}


const DomesticInquiriesDashboard:React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<Inquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(5);



  const router = useRouter();

  const formatDate = (dateString: string | null): string => {
    return dateString ? moment(dateString).format('DD-MM-YYYY') : 'N/A';
  };

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<Inquiry[]>('/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.data) {
        const processedData = response.data.map((item) => ({
          ...item,
          // addedBy: item.user?.name || 'Unknown',
          
        }));
        setInquiries(processedData);
        
      } else {
        console.error('Failed to fetch inquiries', response.status);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  }
      
    fetchInquiries();
  }, []);
  

  const handleUpdateStatus = async (id: number, status: number, action: "offer" | "cancel"
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      const response = await axiosInstance.patch<UpdateResponse>(`/inquiries/${id}/update-inquiry-status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        setAlertMessage(action === "offer" ? "Moved to Offers" : "Moved to Cancellations");
        setIsSuccess(true);
        setInquiries((prevInquiries) => prevInquiries.filter((row) => row.id !== id));
        // console.log(response.data.message);
      }
    } catch (error) {
      setAlertMessage(action === "offer" ? "Failed to move to offers" : "Failed to cancel");
      setIsSuccess(false);
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    setFilteredData(inquiries);
  }, [inquiries]);
  
  
  

  const handleEdit = (id: number) => {
    router.push(`/inquiries/domestic/edit/${id}`);
  };

  const handleOffers = (id: number) => handleUpdateStatus(id, 1,"offer");
  const handleCancel = (id: number) => handleUpdateStatus(id, 0,"cancel");


  useEffect(() => {
    setFilteredData(inquiries); // Ensure it initializes with full data
  }, [inquiries]);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
  
    if (!value) {
      setFilteredData(inquiries); // Restore full data when search is cleared
      return;
    }
  
    const filtered = inquiries.filter((row) =>
      Object.values(row).some(
        (field) => field && String(field).toLowerCase().includes(value) // Check if field is not null
      )
    );
  
    setFilteredData(filtered);
  };
  
  
  

  const columns: ColumnDef<Inquiry>[] = [
    {
      accessorFn: (row) => row.inquiry_number,
      id: "inquiry_number",
      header: "Inquiry Number",
    },
    {
      accessorFn: (row) => formatDate(row.inquiry_date), // Ensure it returns string | null
      id: "inquiry_date",
      header: "Inquiry Date",
    },
    {
      accessorFn: (row) => row.specific_product, // Keep this for sorting/filtering
      id: "specific_product",
      header: "Specific Products",
      cell: ({ row }) => {
        const content = row.getValue("specific_product") as string
        return <TruncatedCell content={content} limit={4} />
      },
    }
    ,
    {
      accessorFn: (row) => row.product_categories,
      id: "product_categories",
      header: "Product Categ.",
      cell: ({ row }) => {
        const content = row.getValue("product_categories") as string
        return <TruncatedCell content={content} limit={4} />
      },
    },
    {
      accessorFn: (row) => row.name,
      id: "name",
      header: "Name",
    },
    {
      accessorFn: (row) => row.location,
      id: "location",
      header: "Location (City)",
    },
    {
      accessorFn: (row) => formatDate(row.first_contact_date),
      id: "first_contact_date",
      header: "1st Contact Date",
    },
    {
      accessorFn: (row) => formatDate(row.second_contact_date),
      id: "second_contact_date",
      header: "2nd Contact Date",
    },
    {
      accessorFn: (row) => formatDate(row.third_contact_date),
      id: "third_contact_date",
      header: "3rd Contact Date",
    },
    {
      accessorFn: (row) => row.notes,
      id: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const content = row.getValue("notes") as string
        return <TruncatedCell content={content} limit={4} />
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
              <Edit className="h-4 w-4 text-black" /> Edit Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer py-2" onClick={() => handleOffers(row.original.id)}>
              <Move className="h-4 w-4 text-gray-600" /> Move to Offers
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer py-2" onClick={() => handleCancel(row.original.id)}>
              <Ban className="h-4 w-4 text-gray-600" /> Cancel
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

  const exportToCSV = () => {
    const worksheet = utils.json_to_sheet(inquiries);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Inquiries");
    writeFile(workbook, "inquiries.csv");
  };

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(inquiries);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Inquiries");
    writeFile(workbook, "inquiries.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((col) => col.header as string)],
      body: inquiries.map((row) =>
        columns.map((col) => row[col.id as keyof Inquiry] || "")
      ),
    });
    doc.save("inquiries.pdf");
  };
  
  

  const exportToClipboard = () => {
    const text = inquiries
      .map((row) => columns.map((col) => row[col.id as keyof Inquiry]).join("\t"))
      .join("\n");
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard"));
  };
  


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <a href="/analytics" className="text-black underline underline-offset-2 font-[500] text-[14px]">
            View Analytics
          </a>
        </div>
        <div className="flex space-x-2">
          <Link href="/inquiries/domestic/create">
          <Button className="bg-black text-white rounded-small text-[11px] captitalize px-2 py-1 cursor-pointer">+ Add New Inquiry</Button>
          </Link>
          <Link href="/inquiries/domestic/upload">
          <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer">+ Bulk Upload</Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer">
                <Upload className="w-4 h-4 text-[13px]" />
                Export 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border border-[#d9d9d9] rounded-lg">
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer py-2 border-b border-b-[#d9d9d9] rounded-none"
                onClick={exportToClipboard}
              >
                <Clipboard className="h-4 w-4 text-black" /> Copy Data
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer py-2 border-b border-b-[#d9d9d9] rounded-none"
                onClick={exportToExcel}
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export Excel
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer py-2 border-b border-b-[#d9d9d9] rounded-none"
                onClick={exportToCSV}
              >
                <FileText className="h-4 w-4 text-blue-600" /> Export CSV
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer py-2"
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
            className="w-64 bg-white"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px]">Total: {inquiries.length}</span>
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
          <>
        
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
        
          
          </>
          
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

export default DomesticInquiriesDashboard;

