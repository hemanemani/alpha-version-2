"use client";

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { Loader, Trash2 } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";


type ProductData = {
    name: string;
    price: number;
    seller_price : number;
    moq:string;
    variety:string;
    product_location:string;
    remarks:string;
    rate:string;
};
  
type SellerFormData = {
  id: number;
  name:string;
  company_name?: string;
  type:string;
  location?:string;
  mobile_number: string | undefined;
  email?: string;
  gst?: string;
  pan?: string;
  bank_details?: string;
  pickup_address?: string;
  status?: string;
  products: ProductData[];
  [key: string]: string | number | ProductData[] | undefined;
}


const SellerForm = () =>
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
    const [formErrors, setFormErrors] = useState({
      name: false,
      mobile_number: false,
    });

    const handleAddProduct = () => {
        setFormData((prev) => ({
          ...prev,
          products: [...prev.products || [], { name: "",variety:"",product_location:"", price: 0,seller_price:0,rate:'',moq:'',remarks:''}],
        }));
      };
    
    const handleProductChange = (
        index: number,
        field: keyof ProductData,
        value: string | number
      ) => {
        const products = formData.products || [];
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
      
      
    

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const newFormErrors = {
        name: !formData.name,
        mobile_number: !formData.mobile_number,
    
      };

      setFormErrors(newFormErrors);

      if (Object.values(newFormErrors).some((error) => error)) {
        return;
      }
      
    
  
      const token = localStorage.getItem('authToken');
  
      if (!token) {
        console.log('User is not authenticated.');
        return;
      }
  
      try {
        setIsLoading(true);
        const response = await axiosInstance.post(
          '/sellers',
          {
            ...formData          
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsLoading(false);
            setAlertMessage("New Seller Added");
            router.push("/sellers/index");
          }, 2000);
        } else {
          setAlertMessage("Failed to add seller...");
          setIsSuccess(false);
          setIsLoading(false);
          console.error('Failed to add seller', response);
        }
      } catch (error: unknown) {
        setAlertMessage("Something Went Wrong...");
        setIsSuccess(false);
        setIsLoading(false);
        if (error instanceof AxiosError) {
          console.error('Error Status:', error.response?.status);
          console.error('Error Data:', error.response?.data);
        } else {
          console.error('An unexpected error occurred:', error);
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
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter seller name" className={`bg-white dark:bg-[#000] ${formErrors.name ? "border-red-500" : ""}`}/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="companyName" className="text-[15px] font-inter-medium">Company Name</Label>
            <Input id="companyName" name="company_name" value={formData.company_name || ''} onChange={handleChange} placeholder="Please enter company name" className='bg-white dark:bg-[#000] border'/>
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
                    <SelectContent className="dark:bg-[#000]">
                    <SelectItem value="FPC" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">FPC</SelectItem>
                    <SelectItem value="FG" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">FG</SelectItem>
                    <SelectItem value="CO" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">CO</SelectItem>
                    <SelectItem value="Individual" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Individual</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 w-[80%]">
              <Label htmlFor="location" className="text-[15px] font-inter-medium">Location</Label>
              <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Please enter location" className='bg-white dark:bg-[#000] border'/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="contactNumber" className="text-[15px] font-inter-medium">Contact Number</Label>
            <Input id="contactNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter contact number" className={`bg-white dark:bg-[#000] ${formErrors.name ? "border-red-500" : ""}`} />
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="Email" className="text-[15px] font-inter-medium">Email</Label>
            <Input id="Email" type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Please enter email" className="bg-white dark:bg-[#000] border"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="gst" className="text-[15px] font-inter-medium">GST</Label>
            <Input id="gst" name="gst" value={formData.gst || ''} onChange={handleChange} placeholder="Please enter GST" className="bg-white dark:bg-[#000] border"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="pan" className="text-[15px] font-inter-medium">PAN</Label>
            <Input id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} placeholder="Please enter PAN" className="bg-white dark:bg-[#000] border"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="bankDetails" className="text-[15px] font-inter-medium">Bank Details</Label>
            <Textarea id="bankDetails" name="bank_details" value={formData.bank_details || ''} onChange={handleChange} placeholder="Enter Bank Details" className="w-full p-2 h-28 border rounded-md bg-white dark:bg-[#000]" />
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="pickupAddress" className="text-[15px] font-inter-medium">Pickup Address</Label>
            <Textarea id="pickupAddress" name="pickup_address" value={formData.pickup_address || ''} onChange={handleChange} placeholder="Enter Pickup Address" className="w-full p-2 h-28 border rounded-md bg-white dark:bg-[#000]" />
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
                    <SelectContent className="dark:bg-[#000]">
                    <SelectItem className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]" value="Select Status">
                      Select Status
                    </SelectItem>
                    <SelectItem value="Best">Best</SelectItem>
                    <SelectItem value="Average" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Average</SelectItem>
                    <SelectItem value="Worst" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Worst</SelectItem>

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
            <TableBody>
              {formData.products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={product.name}
                      onChange={(e) => handleProductChange(index, "name", e.target.value)}
                      placeholder="Product Name"
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
                      value={product.seller_price == 0 ? '' : product.seller_price}
                      onChange={(e) => handleProductChange(index, "seller_price", e.target.value)}
                      placeholder="Seller Price"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={product.price == 0 ? '' : product.price}
                      onChange={(e) => handleProductChange(index, "price", e.target.value)}
                      placeholder="Our Price"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
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

export default SellerForm;


