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
import axios from "axios"
import moment from "moment"
import AlertMessages from "@/components/AlertMessages";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender,getPaginationRowModel } from "@tanstack/react-table";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { File, FileText, Clipboard, FileSpreadsheet } from "lucide-react"


interface InternationalInquiry{
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
  mobile_number: string;

}

interface UpdateResponse {
  success: boolean;
  message: string;
}

interface BlockResponse {
  success: boolean;
  error?: string;
}



const TruncatedCell = ({ content, limit = 10 }: { content: string; limit?: number }) => {
  if (!content) return <span className="text-muted-foreground">-</span>

  const shouldTruncate = content.length > limit
  const displayContent = shouldTruncate ? `${content.slice(0, limit)}...` : content
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">{displayContent}</span>
        </TooltipTrigger>
        {shouldTruncate && (
          <TooltipContent className="w-[150px] text-center bg-white text-black shadow-md p-2 rounded-md font-inter-medium">
            <p>{content}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}


const CancellationsInternationalInquiriesDashboard:React.FC = () => {
  const [inquiries, setInquiries] = useState<InternationalInquiry[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<InternationalInquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  

  const router = useRouter();
  const formatDate = (dateString: string | null): string => {
      return dateString ? moment(dateString).format('DD-MM-YYYY') : 'N/A';
    };

  useEffect(() => {
    const fetchInternationalcancellationData = async () => {
      // setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      // setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<InternationalInquiry[]>('/inquiry-cancellation-international-offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.data) {
        const processedData = response.data.map((item) => ({
          ...item,
          // addedBy: item.user?.name || 'Unknown',
          
        }));
        setInquiries(processedData);
        setFilteredData(response.data);
      } else {
        console.error('Failed to fetch inquiries', response.status);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      // setLoading(false);
    }
  }
      
  fetchInternationalcancellationData();
  }, []);

  const handleUpdateStatus = async (id: number, status: number, 
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      const response = await axiosInstance.patch<UpdateResponse>(`/international-inquiries/${id}/update-international-inquiry-status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        setAlertMessage("Moved Back to Inquiries");
        setIsSuccess(true);
        setFilteredData((prevFilteredData) => prevFilteredData.filter((row) => row.id !== id));  
        // console.log(response.data.message);
      }
    } catch (error) {
      setAlertMessage("Failed to move to Inquiries...");
      setIsSuccess(false);
      console.error("Error updating status:", error);
    }
  };
  

  const handleEdit = (id: number) => {
    router.push(`/inquiries/international/edit/${id}`);
  };

  const handleInquiry = (id: number) => handleUpdateStatus(id, 2);
  const handleBlockInquiry = async (id: number, mobile_number: string, 
  ): Promise<void> =>  {
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      const response = await axiosInstance.post<BlockResponse>(`/block-international-inquiry/${id}`, { mobile_number },
        { headers: 
          { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setAlertMessage("Inquiry Blocked Successfully");
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

   const columns: ColumnDef<InternationalInquiry>[] = [
    {
      accessorFn: (row) => row.inquiry_number,
      id: "inquiry_number",
      header: "Inquiry Number",
    },
    {
      accessorFn: (row) => formatDate(row.inquiry_date),
      id: "inquiry_date",
      header: "Inquiry Date",
    },
    {
      accessorFn: (row) => row.specific_product,
      id: "specific_product",
      header: "Specific Products",
      cell: ({ row }) => {
        const content = row.getValue("specific_product") as string
        return <TruncatedCell content={content} limit={16} />
      },
    }
    ,
    {
      accessorFn: (row) => row.product_categories,
      id: "product_categories",
      header: "Product Categ.",
      cell: ({ row }) => {
        const content = row.getValue("product_categories") as string
        return <TruncatedCell content={content} limit={16} />
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
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={() => handleInquiry(row.original.id)}>
              <Move className="h-4 w-4 text-gray-600" /> Move back to Inquiry
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={() => handleBlockInquiry(row.original.id,row.original.mobile_number)}>
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
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize,pageIndex:0 } }, 
    });
  
    const exportToCSV = () => {
      const worksheet = utils.json_to_sheet(inquiries);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Cancelled International Inquiries");
      writeFile(workbook, "cancelled-international-inquiries.csv");
    };
  
    const exportToExcel = () => {
      const worksheet = utils.json_to_sheet(inquiries);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Cancelled International Inquiries");
      writeFile(workbook, "cancelled-international-inquiries.xlsx");
    };
  
    const exportToPDF = () => {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [columns.map((col) => col.header as string)],
        body: inquiries.map((row) =>
          columns.map((col) => row[col.id as keyof InternationalInquiry] || "")
        ),
      });
      doc.save("cancelled-international-inquiries.pdf");
    };
  
    const exportToClipboard = () => {
      const text = inquiries
        .map((row) => columns.map((col) => row[col.id as keyof InternationalInquiry]).join("\t"))
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
          <Link href="/inquiries/international/create">
          <Button className="bg-black text-white rounded-small text-[11px] captitalize px-2 py-1 cursor-pointer font-inter-semibold">+ Add New Inquiry</Button>
          </Link>
          <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold">+ Bulk Upload</Button>
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
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px] font-inter-medium">Total: {inquiries.length}</span>
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
              <SelectTrigger className="w-[60px] h-[25px] text-[13px] p-2 font-inter-semibold">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 15, 20, 25].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
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
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-4 font-inter-medium">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      {/* )} */}
      </div>
      <div className="py-4 text-[#7f7f7f] font-inter-medium flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="text-[11px] px-2 py-1"
        >
          Previous
        </Button>
        <Button variant="outline" className="text-[11px] px-2 py-1" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
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

export default CancellationsInternationalInquiriesDashboard;

