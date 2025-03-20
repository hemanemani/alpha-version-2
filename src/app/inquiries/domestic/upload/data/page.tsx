"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FolderOpen  } from "lucide-react"
import axiosInstance from "@/lib/axios"


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
    setFilteredData: React.Dispatch<React.SetStateAction<UploadItem[]>>
  }
  


const DomesticUploadData:React.FC<UploadProps> = ({uploadsData,filteredData,setFilteredData}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
    
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
      setLoading(false)
    }
  }, [uploadsData])

  const handleDownload = (filePath: string | number | null | undefined) => {
    if (!filePath) {
      console.error("File path is missing.");
      return;
    }
  
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://alpha.ogaenik.com/api";
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



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-black font-[500] text-[18px]">
            All Listings
          </p>
          <p className="text-[13px] text-[#848091] font-[500]">Files that have been previously uploaded
          </p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a2a1a1] w-[15px]" />
          <Input
            className="w-64 bg-white"
            placeholder="Search for files..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
          <span className="text-[#7f7f7f] text-[13px]">Total: {uploadsData.length}</span>
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
              Date Uploaded
              </TableHead>
              <TableHead className="cursor-pointer py-6">
              Uploaded By
              </TableHead>
              <TableHead className="cursor-pointer py-6">
              Status
              </TableHead>

              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>                
                <TableCell className="text-[14px] font-[500] text-black py-4">

                <div className="flex items-center gap-3">
                  {/* File Icon */}
                  <div className="flex items-center justify-center w-10 h-10">
                    <FolderOpen className="text-gray-600 w-5 h-5" />
                  </div>

                  {/* File Info */}
                  <div>
                    <p className="text-black font-medium">{item.file_name}</p>
                    <p className="text-[13px] text-gray-500">{(item.file_size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>

                </TableCell>
                
                
                <TableCell className="text-[14px] font-[500] text-black py-4">{item.uploaded_at}</TableCell>
                <TableCell className="text-[14px] font-[500] text-black py-4">{item.uploaded_by_name}</TableCell>
                <TableCell className="text-[14px] font-[500] text-[#78ad47] py-4">{item.status}</TableCell>

               
                <TableCell className="text-[14px] font-[500] text-black py-4">
                <Button
                    variant="outline"
                    className="bg-transparent text-black rounded-md text-[12px] capitalize border border-gray-300 cursor-pointer mr-2"
                    onClick={()=>handleDelete(item.id)}
                    >
                    Delete
                </Button>
                <Button
                    variant="outline"
                    className="bg-black text-white rounded-md text-[12px] capitalize border border-gray-300 cursor-pointer hover:bg-black hover:text-white"
                    onClick={() => handleDownload(item.file_path)}
                    >
                    Download
                </Button>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      </div>
      <div className="p-4 text-[#7f7f7f] text-[13px] font-[500]">
          Showing: {filteredData.length} of {uploadsData.length}
        </div>

    </div>
  )
}

export default DomesticUploadData;

