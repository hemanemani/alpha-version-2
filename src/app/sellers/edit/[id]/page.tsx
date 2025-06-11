"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { Loader, Trash2 } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";

type ProductData = {
    name: string;
    variety:string;
    product_location:string;
    price: number;
    seller_price : number;
    moq:string;
    remarks:string;
    rate:number;

};
  
type SellerFormData = {
  id: number;
  name:string;
  company_name?: string;
  mobile_number: string | undefined;
  type:string;
  location?:string;
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
      type:'',
      location:'',
      company_name: '',
      mobile_number: '',
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
          products: [...prev.products || [], { name: "", variety:"",product_location:"",price: 0,seller_price:0,rate:0,moq:'',remarks:''}],
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
          [field]: field === "price" || field === "seller_price" ? Number(value) : String(value),
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

    const handleDeleteProduct = (index: number) => {
      const updatedProducts = formData.products?.filter((_, i) => i !== index) || [];
      setFormData((prev) => ({
        ...prev,
        products: updatedProducts,
      }));
    };
    
    

    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px] font-inter-medium">Name</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter seller name" className='bg-white dark:bg-gray-950 border'/>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="companyName" className="text-[15px] font-inter-medium">Company Name</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="companyName" name="company_name" value={formData.company_name || ''} onChange={handleChange} placeholder="Please enter company name" className='bg-white dark:bg-gray-950 border'/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="contactNumber" className="text-[15px] font-inter-medium">Contact Number</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="contactNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter contact number" className='bg-white dark:bg-gray-950 border'/>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="Email" className="text-[15px] font-inter-medium">Email</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="Email" type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Please enter email" className="bg-white dark:bg-gray-950 border"/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="role" className="text-[15px]">Type</Label>
                <Select 
                    name="type" 
                    value={formData.type} 
                    onValueChange={(value) => handleChange({ target: { name: "type", value } })}>
                    <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                    <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="FPC" className="text-[13px] cursor-pointer">FPC</SelectItem>
                    <SelectItem value="FG" className="text-[13px] cursor-pointer">FG</SelectItem>
                    <SelectItem value="CO" className="text-[13px] cursor-pointer">CO</SelectItem>
                    <SelectItem value="Individual" className="text-[13px] cursor-pointer">Individual</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 w-[80%]">
              <Label htmlFor="location" className="text-[15px] font-inter-medium">Location</Label>
              <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Please enter location" className='bg-white dark:bg-gray-950 border'/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="gst" className="text-[15px] font-inter-medium">GST</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="gst" name="gst" value={formData.gst || ''} onChange={handleChange} placeholder="Please enter GST" className="bg-white dark:bg-gray-950 border"/>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="pan" className="text-[15px] font-inter-medium">PAN</Label>
            { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
              <Input id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} placeholder="Please enter PAN" className="bg-white dark:bg-gray-950 border"/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="bankDetails" className="text-[15px] font-inter-medium">Bank Details</Label>
            { isInputLoading ? (<SkeletonCard height="h-[111px]"  /> ) : (
              <Textarea id="bankDetails" name="bank_details" value={formData.bank_details || ''} onChange={handleChange} placeholder="Enter Bank Details" className="w-full p-2 h-28 border rounded-md bg-white dark:bg-gray-950" />
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="pickupAddress" className="text-[15px] font-inter-medium">Pickup Address</Label>
            { isInputLoading ? (<SkeletonCard height="h-[111px]"  /> ) : (
              <Textarea id="pickupAddress" name="pickup_address" value={formData.pickup_address || ''} onChange={handleChange} placeholder="Enter Pickup Address" className="w-full p-2 h-28 border rounded-md bg-white dark:bg-gray-950" />
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
                    <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                    <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem className="text-[13px] cursor-pointer" value="Select Status">
                      Select Status
                    </SelectItem>
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
            <Button type="button" className="bg-transparent text-black dark:text-white rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold" onClick={handleAddProduct}>+ Add New Product</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Seller Price</TableHead>
              <TableHead>Our Price</TableHead>
              <TableHead>Rate of</TableHead>
              <TableHead>MOQ</TableHead>
              <TableHead>Remarks</TableHead>

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
                      value={product.variety}
                      onChange={(e) => handleProductChange(index, "variety", e.target.value)}
                      placeholder="Variety"
                    />
                </TableCell>
                <TableCell>
                    <Input
                      value={product.product_location}
                      onChange={(e) => handleProductChange(index, "product_location", e.target.value)}
                      placeholder="Location"
                    />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.seller_price}
                    onChange={(e) => handleProductChange(index, "seller_price", e.target.value)}
                    placeholder="Seller Price"
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
                <TableCell>
                    <Input
                      type="number"
                      value={product.rate}
                      onChange={(e) => handleProductChange(index, "rate", e.target.value)}
                      placeholder="Rate of"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Input
                      value={product.moq}
                      onChange={(e) => handleProductChange(index, "moq", e.target.value)}
                      placeholder="MOQ"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={product.remarks}
                      onChange={(e) => handleProductChange(index, "remarks", e.target.value)}
                      placeholder="Remarks"
                    />
                  </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(index)}
                    className="text-[12px] px-2 py-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
        </Table>
      </div>
        
        <RainbowButton 
         type="submit"
         className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black dark:bg-white text-white dark:text-black capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer `}
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


