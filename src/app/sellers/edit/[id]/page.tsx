"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { Loader } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";

type ProductData = {
    name: string;
    price: number;
};
  
type SellerFormData = {
  id: number;
  name:string;
  company_name?: string;
  contact_number: string | undefined;
  email?: string;
  gst?: string;
  pan?: string;
  bank_details?: string;
  pickup_address?: string;
  status?: string;
  products: ProductData[];
  [key: string]: string | number | ProductData[] | undefined;
}

interface SellerApiResponse {
    seller: SellerFormData;
  }


const EditSellerForm = () =>
  {
    const router = useRouter();
  
    const [formData, setFormData] = useState<SellerFormData>({
      id:0,
      name:'',
      company_name: '',
      contact_number: '',
      email: '',
      gst: '',
      pan: '',
      bank_details: '',
      pickup_address: '',
      status: '',
      products:[]
    });

    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInputLoading, setIsInputLoading] = useState(true);
    const { id } = useParams<{ id: string }>() ?? {};

    const handleAddProduct = () => {
        setFormData((prev) => ({
          ...prev,
          products: [...prev.products || [], { name: "", price: 0 }],
        }));
      };
    
    const handleProductChange = (
        index: number,
        field: keyof ProductData,
        value: string | number
      ) => {
        const products = formData.products || [];
        console.log(products)
        const updatedProducts: ProductData[] = [...products];
      
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: field === "price" ? Number(value) : String(value),
        };
      
        setFormData((prev) => ({
          ...prev,
          products: updatedProducts,
        }));
    };
      
      


    useEffect(() => {
        if (id) {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.log("No token found in localStorage");
                return;
            }
            
            const fetchItem = async () => {
                try {
                    const response = await axiosInstance.get<SellerApiResponse>(`sellers/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    setFormData({
                        ...response.data.seller,
                        products: response.data.seller.products || [],
                    });
                      

                } catch (error) {
                    console.error('Error fetching item:', error);
                }
                finally{
                    setIsInputLoading(false);
                  }
            };
            fetchItem();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.log("Seller is not authenticated.");
            return;
        }

        try {
            setIsLoading(true);
            const url = id ? `sellers/${id}` : 'sellers';
            const method = id ? 'put' : 'post';
                
            const response = await axiosInstance({
                method: method,
                url: url,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                data: formData,

            });

            setFormData({
                ...response.data.seller,
                products: response.data.seller.products || [],
              });
      

            if (response.status >= 200 && response.status < 300) {
                setIsSuccess(true);
                setTimeout(() => {
                setIsLoading(false);
                setAlertMessage("Seller Updated");
                router.push("/sellers/index");
                }, 2000);      
            } else {
                setAlertMessage("Failed to add seller");
                setIsSuccess(false); 
                setIsLoading(false);    
                console.error(`${id ? "Failed to edit" : "Failed to add"} seller`, response.status);
            }  
        } catch (error) {
            setAlertMessage("Something Went Wrong...");
            setIsSuccess(false);
            setIsLoading(false);
            console.error("Error submitting seller:", error);
            if (error instanceof AxiosError && error.response) {
              console.error("Validation errors:", error.response.data);
            }
          }
          
    };

    const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    
        setFormData((prev) => ({
        ...prev,
        [name]: value,
        }));
    };
    
    

    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px] font-inter-medium">Name</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter seller name" className='bg-white border'/>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="companyName" className="text-[15px] font-inter-medium">Company Name</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="companyName" name="company_name" value={formData.company_name || ''} onChange={handleChange} placeholder="Please enter company name" className='bg-white border'/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="contactNumber" className="text-[15px] font-inter-medium">Contact Number</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="contactNumber" name="contact_number" value={formData.contact_number || ''} onChange={handleChange} placeholder="Please enter contact number" className='bg-white border'/>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="Email" className="text-[15px] font-inter-medium">Email</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="Email" type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Please enter email" className="bg-white"/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="gst" className="text-[15px] font-inter-medium">GST</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="gst" name="gst" value={formData.gst || ''} onChange={handleChange} placeholder="Please enter GST" className="bg-white"/>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="pan" className="text-[15px] font-inter-medium">PAN</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} placeholder="Please enter PAN" className="bg-white"/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="bankDetails" className="text-[15px] font-inter-medium">Bank Details</Label>
            { isInputLoading ? (<SkeletonCard height="h-[111px]"  /> ) : (
              <Textarea id="bankDetails" name="bank_details" value={formData.bank_details || ''} onChange={handleChange} placeholder="Enter Bank Details" className="w-full p-2 h-28 border rounded-md bg-white" />
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="pickupAddress" className="text-[15px] font-inter-medium">Pickup Address</Label>
            { isInputLoading ? (<SkeletonCard height="h-[111px]"  /> ) : (
              <Textarea id="pickupAddress" name="pickup_address" value={formData.pickup_address || ''} onChange={handleChange} placeholder="Enter Pickup Address" className="w-full p-2 h-28 border rounded-md bg-white" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="role" className="text-[15px]">Status</Label>
                <Select 
                    name="status" 
                    value={formData.status} 
                    onValueChange={(value) => handleChange({ target: { name: "status", value } })}>
                    <SelectTrigger className="w-full border border-gray-300 px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                    <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="best">Best</SelectItem>
                    <SelectItem value="average" className="text-[13px] cursor-pointer">Average</SelectItem>
                    <SelectItem value="worst" className="text-[13px] cursor-pointer">Worst</SelectItem>

                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-4">
        <div className="flex justify-between">
            <h2 className="text-[18px] font-inter-semibold">Products</h2>
            <Button type="button" className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold" onClick={handleAddProduct}>+ Add New Product</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
          <TableBody>
          {(formData.products || []).map((product, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={product.name}
                    onChange={(e) => handleProductChange(index, "name", e.target.value)}
                    placeholder="Product Name"
                    className="h-[36px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={product.price}
                    onChange={(e) => handleProductChange(index, "price", e.target.value)}
                    placeholder="Price"
                    className="h-[36px]"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
        </Table>
      </div>
        
        <RainbowButton 
         type="submit"
         className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer `}
         disabled={isLoading}
         >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
        ) : (
            "Add Seller"
          )}
        </RainbowButton>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
      </form>
    
    
  )
}

export default EditSellerForm;


