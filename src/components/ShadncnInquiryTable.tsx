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
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation"
import moment from "moment"
import AlertMessages from "@/components/AlertMessages";
import { RainbowButton } from "./RainbowButton"

interface InternationalInquiry{
  id: number;
  inquiry_number: string;
  inquiry_date: string;
  specific_product: string;
  product_categories: string;
  name: string;
  location: string;
  first_contact_date: string;
  second_contact_date: string;
  third_contact_date: string;
  notes: string;
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
          <span className="cursor-default">{displayContent}</span>
        </TooltipTrigger>
        {/* {shouldTruncate && ( */}
          <TooltipContent className="w-[150px] text-center bg-white text-black shadow-md p-2 rounded-md font-inter-medium">
            <p>{content}</p>
          </TooltipContent>
        {/* )} */}
      </Tooltip>
    </TooltipProvider>
  )
}


const InternationalInquiriesDashboard:React.FC = () => {
  const [inquiries, setInquiries] = useState<InternationalInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<InternationalInquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  const formatDate = (dateString: string | null): string => {
      return dateString ? moment(dateString).format('DD-MM-YYYY') : '-';
    };

  const handleUpdateStatus = async (id: number, status: number, action: "offer" | "cancel"
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      const response = await axiosInstance.patch<UpdateResponse>(`international-inquiries/${id}/update-international-inquiry-status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        setAlertMessage(action === "offer" ? "Moved to Offers" : "Moved to Cancellations");
        setIsSuccess(true);
        setFilteredData((prevFilteredData) => prevFilteredData.filter((row) => row.id !== id));  
        // console.log(response.data.message);
      }
    } catch (error) {
      setAlertMessage(action === "offer" ? "Failed to move to offers" : "Failed to cancel");
      setIsSuccess(false);
      console.error("Error updating status:", error);
    }
  };
  
  const handleEdit = (id: number) => {
    router.push(`/inquiries/international/edit/${id}`);
  };
  

  const handleOffers = (id: number) => handleUpdateStatus(id, 1,"offer");
  const handleCancel = (id: number) => handleUpdateStatus(id, 0,"cancel");


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
    const filtered = inquiries.filter((row) =>
      Object.values(row).some(
        (field) => (field ? String(field).toLowerCase().includes(value) : false)
      )      
    );
    setFilteredData(filtered);
  };

  
  useEffect(() => {
    const fetchInternationalInquiryData = async () => {
      setLoading(true); 
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get<InternationalInquiry[]>('/international_inquiries', {
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
      setLoading(false);
    }
  }
      
    fetchInternationalInquiryData();
  }, []);


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
          <RainbowButton className="bg-black text-white text-[11px] captitalize px-2 py-1 h-[37px] cursor-pointer font-inter-semibold">+ Add New Inquiry</RainbowButton>
          </Link>
          <Link href="/inquiries/international/upload">
          <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold">+ Bulk Upload</Button>
          </Link>
          <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold">
            <Upload className="w-4 h-4 text-[13px]" />
            Export
          </Button>
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
            <Select defaultValue="10">
              <SelectTrigger className="w-[60px] h-[25px] text-[13px] p-2 font-inter-semibold cursor-pointer">                <SelectValue />
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
                Inquiry Number
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Inquiry Date
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Specific Products
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Product Categ.
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Name
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Location (City)
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                1st Contact Date
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                2nd Contact Date
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                3rd Contact Date
              </TableHead>
              <TableHead className="cursor-pointer py-6">
                Notes
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-inter-medium">
            {filteredData.map((inquiry) => (
              <TableRow key={inquiry.id}>                
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.inquiry_number}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{formatDate(inquiry.inquiry_date)}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <TruncatedCell content={inquiry.specific_product} />
                </TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <TruncatedCell content={inquiry.product_categories} />
                </TableCell>

                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.name}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{inquiry.location}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{formatDate(inquiry.first_contact_date)}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{formatDate(inquiry.second_contact_date)}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{formatDate(inquiry.third_contact_date)}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <TruncatedCell content={inquiry.notes} />
                </TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">
                  <DropdownMenu open={openId === inquiry.id} onOpenChange={(isOpen) => setOpenId(isOpen ? inquiry.id : null)}>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                        <MoreHorizontal className="w-8 h-8 bg-[#d9d9d9] rounded-full p-1" />
                    </DropdownMenuTrigger>                 
                    <DropdownMenuContent align="end" className="w-52 bg-white border border-[#d9d9d9] rounded-lg" forceMount>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer border-b border-b-[#d9d9d9] rounded-none py-2" onClick={()=>handleEdit(inquiry.id)}
                        >
                        <Edit className="h-4 w-4 text-black"/> Edit Inquiry
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2"
                        onClick={()=>handleOffers(inquiry.id)}>
                        <Move className="h-4 w-4 text-gray-600" /> Move to Offers
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-sm font-inter-semibold text-gray-900 cursor-pointer py-2" onClick={()=>handleCancel(inquiry.id)}>
                        <Ban className="h-4 w-4 text-gray-600" /> Cancel
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
          Showing: {inquiries.length} of {inquiries.length}
        </div>
        {alertMessage && (
          <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
      )}

    </div>
  )
}

export default InternationalInquiriesDashboard;

