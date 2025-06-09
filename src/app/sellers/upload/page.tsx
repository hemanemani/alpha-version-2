"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { FileUp, FolderOpen, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import axiosInstance from "@/lib/axios"
import SellerUploadData from "./upload-table-data"
import { Button } from "@/components/ui/button"
import { AxiosError } from "axios"


interface User {
  id: number;
  name: string;
}

interface UploadSeller {
  id: number;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  status: string;
  user?: User;
  file_path:string;

}
  
  
const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState<ErrorMessage[]>([]);
  const [uploadsData, setUploadsData] = useState<UploadSeller[]>([]);
  const [filteredData, setFilteredData] = useState<UploadSeller[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

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

  const fetchSellerData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      return;
    }

    try {
      const response = await axiosInstance.get<UploadSeller[]>("/bulk-seller-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data) {
        const processedData:UploadSeller[] = response.data.map((item) => ({
          ...item,
        }));
        setUploadsData(processedData);
        setFilteredData(processedData);

    } else {
        console.error("Failed to fetch sellers", response.status);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSellerData();
  }, []);


  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setErrorMessages([]);
    setSuccessMessage(""); 

    const token = localStorage.getItem('authToken');
  
    if (!token) {
      console.log('User is not authenticated.');
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

  
    try {
        const response = await axiosInstance.post('/sellers/bulk-upload',formData,  {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            },
      
        });
        if (response.status === 200) {
          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
            setFile(null);
          }, 500);

            setSuccessMessage(`${response.data.file_name} uploaded successfully!`);
            await fetchSellerData();
          }
    
    } 
    catch (error) {
      // Show full progress even on error
      console.error(error);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      
      const axiosError = error as AxiosError<{ errors: ErrorMessage[] }>;
      if (axiosError.response?.data?.errors) {
        setErrorMessages(axiosError.response.data.errors);
      }
    }  finally {
      setIsUploading(false);
    }
  
  }
  type ErrorMessage = {
  row: number;
  errors: string[];
};


  return (
    <>
     <div className="flex justify-end items-center mb-6">   
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
                      className="col-span-1 bg-red-600 text-white text-[12px] font-inter-semibold px-4 py-2 rounded-full text-center"
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
                    className="bg-black text-white rounded-md text-[13px] capitalize border border-gray-300 px-6 py-2 cursor-pointer font-inter-semibold"
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
                    <p className="font-inter-semibold text-[15px] mb-1">
                      <span className="underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[13px] text-[#848091] font-inter-medium">Maximum file size 1 MB. Only CSV format</p>
                  </div>
                  <div>
                    
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                        {successMessage && 
                        <span className="bg-[#4bb543] text-white px-3 py-1 text-[12px] rounded-full font-inter-semibold">
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
                      <p className="font-inter-semibold">{file.name}</p>
                      <p className="text-[13px] text-gray-500 font-inter-medium">{(file.size / 1024).toFixed(2)} KB</p>
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
                        <span className="text-sm font-inter-medium">{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 rounded-full" />
                    </div>
                    
                  ) : (
                    <>
                    <div className="flex justify-center">
                      <button
                        onClick={handleUpload}
                        className="bg-black text-white rounded-sm text-[12px] capitalize border border-gray-300 cursor-pointer px-8 py-[7px] font-inter-semibold"
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
      <SellerUploadData
        uploadsData={uploadsData}
        // setUploadsData={setUploadsData}
        filteredData={filteredData}
        setFilteredData={setFilteredData}
        isLoading = {isLoading}
      />
    </>
  );
  
}
  

export default FileUpload;