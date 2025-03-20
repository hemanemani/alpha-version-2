"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { FileUp, FolderOpen, Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import axiosInstance from "@/lib/axios"
import DomesticUploadData from "./data/page"
import { Button } from "@/components/ui/button"
import { AxiosError } from "axios"
import ExportDialog from "@/components/ExportDialog"


interface User {
  id: number;
  name: string;
}

interface UploadInquiry {
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
  
  
const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState<ErrorMessage[]>([]);
  const [uploadsData, setUploadsData] = useState<UploadInquiry[]>([]);
  const [filteredData, setFilteredData] = useState<UploadInquiry[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);


  const handleDownload = async (): Promise<void> => {
    const token: string | null = localStorage.getItem("authToken");
  
    if (!token) {
      console.log("User is not authenticated.");
      return;
    }
  
    try {
      const response = await axiosInstance.get<Blob>("/domestic-template-download", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Ensures the response is treated as a file
      });
  
      // Create a link element to trigger the file download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = "domestic-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };
  


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile && selectedFile.type === "text/csv" && selectedFile.size <= 1024 * 1024) {
      setFile(selectedFile)
      setUploadProgress(0)
    } else {
      alert("Please select a CSV file no larger than 1MB.")
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxSize: 1024 * 1024, // 1MB
    multiple: false,
  })

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  const fetchInquiryData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      return;
    }

    try {
      const response = await axiosInstance.get<UploadInquiry[]>("/bulk-domestic-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data) {
        const processedData:UploadInquiry[] = response.data.map((item) => ({
          ...item,
          uploaded_by_name: item.user?.name ?? "Unknown", // Ensures fallback value if undefined

        }));
        setUploadsData(processedData);
        setFilteredData(processedData);

    } else {
        console.error("Failed to fetch inquiries", response.status);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  };
  useEffect(() => {
    fetchInquiryData();
  }, []);


  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setErrorMessages([]);
    setSuccessMessage(""); 
    let interval: NodeJS.Timeout;

    const token = localStorage.getItem('authToken');
  
    if (!token) {
      console.log('User is not authenticated.');
      return;
    }

    const formData = new FormData();
    formData.append("file", file);


    interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  
    try {
        const response = await axiosInstance.post('/inquiries/bulk-upload',formData,  {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.status === 200) {
          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
            setFile(null);
          }, 500);

            setSuccessMessage(`${response.data.file_name} uploaded successfully!`);
            await fetchInquiryData();
          }
    
    } 
    catch (error) {
      // Show full progress even on error
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      
      const axiosError = error as AxiosError<{ errors: ErrorMessage[] }>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors);
      }
    }  finally {
      clearInterval(interval);
      setIsUploading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessages([]);
      }, 5000);
    }
  
  }
  type ErrorMessage = {
  row: number;
  errors: string[];
};


  return (
    <>
     <div className="flex justify-end items-center mb-6">
        <div className="flex space-x-2">
          <Button className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent hover:text-black" onClick={handleOpen}
          >
            <Upload className="w-4 h-4 text-[13px]" />
            Export
          </Button>
        </div>
        <ExportDialog modalOpen={modalOpen} handleClose={handleClose} handleDownload={handleDownload} />
        

        
      </div>
      <div className="mb-8">
        <div className="border-2 border-dashed rounded-lg h-[200px] relative flex">
          
          {/* Error Messages Display */}
          {errorMessages.length > 0 ? (
            <div className="flex justify-between w-full p-4">
              <div className="flex flex-wrap items-center gap-6 w-3/4 max-h-[130px] overflow-auto">
                {/* Error List */}
                {errorMessages.map((error, index) =>
                  error.errors.map((err, errIndex) => (
                    <div
                      key={`${index}-${errIndex}`}
                      className="col-span-1 bg-red-600 text-white text-[12px] font-500 px-4 py-2 rounded-full text-center"
                    >
                      Row {error.row}: {err}
                    </div>
                  ))
                )}
                </div>


  
                {/* Retry Button */}
                <div className="w-1/4 flex justify-end items-end">
                  <Button
                    variant="outline"
                    className="bg-black text-white rounded-md text-[13px] capitalize border border-gray-300 px-6 py-2 cursor-pointer"
                    onClick={() => {
                      setErrorMessages([]);
                      setUploadProgress(0);
                    }}
                  >
                    Retry
                  </Button>
                </div>
            </div>
          ) : (
            <>
              {/* File Upload Section */}
              {!file ? (
                <>
                <div
                  {...getRootProps()}
                  className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    
                    <FileUp className="h-12 w-12 mb-4 text-black block ml-auto mr-auto" />
                    <p className="font-[600] text-[15px] mb-1">
                      <span className="underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[13px] text-[#848091] font-[500]">Maximum file size 1 MB. Only CSV format</p>
                  </div>
                  <div>
                    
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                        {successMessage && 
                        <span className="bg-[#4bb543] text-white px-3 py-1 text-[12px] rounded-full font-[500]">
                            {successMessage}
                        </span>
                        }
                        
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                  <FolderOpen className="text-gray-600 w-8 h-8" />

                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-[13px] text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
  
                  {/* Upload Progress */}
                  {isUploading ? (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 rounded-full" />
                    </div>
                    
                  ) : (
                    <>
                    <div className="flex justify-center">
                      <button
                        onClick={handleUpload}
                        className="bg-black text-white rounded-sm text-[12px] capitalize border border-gray-300 cursor-pointer px-8 py-[7px]"
                        >
                        Upload
                      </button>
                    </div>
                   
                  </>
                  
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
  
      {/* DomesticUploadData Component */}
      <DomesticUploadData
        uploadsData={uploadsData}
        // setUploadsData={setUploadsData}
        filteredData={filteredData}
        setFilteredData={setFilteredData}
      />
    </>
  );
  
}
  

export default FileUpload;