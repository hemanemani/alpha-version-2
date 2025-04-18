"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { format, parse } from "date-fns";
import { DatePicker } from "@/components/date-picker";
import { Loader } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";

interface InternationalInquiryFormData{
  id: number;
  inquiry_number:number;
  mobile_number: string;
  inquiry_date: string | undefined;
  product_categories: string;
  specific_product: string;
  name?: string;
  location: string;
  inquiry_through: string;
  inquiry_reference: string;
  first_contact_date: string | undefined;
  first_response: string;
  second_contact_date: string | undefined;
  second_response: string;
  third_contact_date: string | undefined;
  third_response: string;
  notes: string;
  user_id?: string;
  
  [key: string]: string | number | null | undefined | Date;


}

interface User {
  id: number;
}

const InternationalInquiryForm = () =>
{
  const router = useRouter();
  const [formData, setFormData] = useState<InternationalInquiryFormData>({
  id:0,
  inquiry_number: 0,
  mobile_number: '',
  inquiry_date: undefined,
  product_categories: '',
  specific_product: '',
  name: '',
  location: '',
  inquiry_through: '',
  inquiry_reference: '',
  first_contact_date: undefined,
  first_response: '',
  second_contact_date: undefined,
  second_response: '',
  third_contact_date: undefined,
  third_response: '',
  notes: '',
  user_id: '',
});
const [user, setUser] = useState<User | null>(null);
const [alertMessage, setAlertMessage] = useState("");
const [isSuccess, setIsSuccess] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const [formErrors, setFormErrors] = useState({
  inquiry_number: false,
  inquiry_date: false,
  name: false,
  mobile_number: false,
  first_contact_date: false,
  first_response: false,
});


useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: name.includes('date') ? new Date(value) : value,
  }));
};

const handleDateChange = (date: Date | undefined, field: keyof InternationalInquiryFormData) => {
      setFormData((prev) => ({
        ...prev,
        [field]: date ? format(date, "dd-MM-yyyy") : undefined, // ✅ Keep "DD-MM-YYYY" format for backend
      }));
    };
    


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const newFormErrors = {
    inquiry_number: !formData.inquiry_number,
    inquiry_date: !formData.inquiry_date,
    name: !formData.name,
    mobile_number: !formData.mobile_number,
    first_contact_date: !formData.first_contact_date,
    first_response: !formData.first_response,

  };

  setFormErrors(newFormErrors);

  if (Object.values(newFormErrors).some((error) => error)) {
    return;
  }

  const token = localStorage.getItem('authToken');

  if (!token || !user) {
    console.log('User is not authenticated.');
    return;
  }

  try {
    setIsLoading(true);
    const response = await axiosInstance.post(
      '/international_inquiries',
      {
        ...formData,
        user_id: user.id,
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
        setAlertMessage("International Inquiry Added");
        router.push("/inquiries/international");
      }, 2000);
      // router.push('/inquiries/international');
    } 
     else {
      setAlertMessage('Failed to add international inquiry');
      setIsSuccess(false);
      setIsLoading(false);
      console.error('Failed to add international inquiry', response);
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
  

  return (
    <form className="px-20 py-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryNumber" className="text-[15px] font-inter-medium">Inquiry Number</Label>          
          <Input id="inquiryNumber" name="inquiry_number" value={formData.inquiry_number || ''} placeholder="Please enter inquiry number" onChange={handleChange} className={`bg-white border ${formErrors.inquiry_number ? "border-red-500" : "border-gray-300"}`} />
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryDate" className="text-[15px] font-inter-medium">Inquiry Date</Label>
          <div className={`bg-white rounded-md border ${formErrors.inquiry_date ? "border-red-500" : "border-gray-300"}`}>
          <DatePicker
            date={formData.inquiry_date ? parse(formData.inquiry_date, "dd-MM-yyyy", new Date()) : undefined} 
            setDate={(date) => handleDateChange(date, "inquiry_date")}
            placeholder="DD-MM-YYYY"
          />
          </div>
        </div>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="name" className="text-[15px] font-inter-medium">Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter customer name" className={`bg-white border ${formErrors.name ? "border-red-500" : "border-gray-300"}`}/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="mobileNumber" className="text-[15px] font-inter-medium">Mobile Number</Label>
          <Input id="mobileNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter mobile number" className={`bg-white border ${formErrors.mobile_number ? "border-red-500" : "border-gray-300"}`}/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="location" className="text-[15px] font-inter-medium">Location (City)</Label>
          <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Please enter city name" className="bg-white"/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="productCategories" className="text-[15px] font-inter-medium">Product Categories</Label>
          <Input id="productCategories" name="product_categories" value={formData.product_categories || ''} onChange={handleChange} placeholder="Please enter product categories" className="bg-white"/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="specificProduct" className="text-[15px] font-inter-medium">Specific Product</Label>
          <Input id="specificProduct" name="specific_product" value={formData.specific_product || ''} onChange={handleChange} placeholder="Please enter name of specific products" className="bg-white"/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryThrough" className="text-[15px] font-inter-medium">Inquiry Through</Label>
          <Input id="inquiryThrough" name="inquiry_through" value={formData.inquiry_through || ''} onChange={handleChange} placeholder="Please enter inquiry through" className="bg-white"/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryReference" className="text-[15px] font-inter-medium">Inquiry Reference</Label>
          <Input id="inquiryReference" name="inquiry_reference" value={formData.inquiry_reference || ''} onChange={handleChange} placeholder="Please enter inquiry reference" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="firstContactDate" className="text-[15px] font-inter-medium">1st Contact Date</Label>
          <div className={`bg-white rounded-md border ${formErrors.first_contact_date ? "border-red-500" : "border-gray-300"}`}>
          <DatePicker 
            date={formData.first_contact_date ? parse(formData.first_contact_date, "dd-MM-yyyy", new Date()) : undefined} 
            setDate={(date) => handleDateChange(date, "first_contact_date")} 
            placeholder="DD-MM-YYYY" 
          />

          </div>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="firstResponse" className="text-[15px] font-inter-medium">1st Response</Label>
          <Input id="firstResponse" name="first_response" value={formData.first_response || ''} onChange={handleChange} placeholder="Please enter 1st response" className={`bg-white border ${formErrors.first_response ? "border-red-500" : "border-gray-300"}`} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="secondContactDate" className="text-[15px] font-inter-medium">2nd Contact Date</Label>
          <div className="bg-white rounded-md border">
          <DatePicker 
            date={formData.second_contact_date ? parse(formData.second_contact_date, "dd-MM-yyyy", new Date()) : undefined} 
            setDate={(date) => handleDateChange(date, "second_contact_date")} 
            placeholder="DD-MM-YYYY" 
          />

          </div>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="secondResponse" className="text-[15px] font-inter-medium">2nd Response</Label>
          <Input id="secondResponse" name="second_response" value={formData.second_response || ''} onChange={handleChange} placeholder="Please enter 2nd response" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="thirdContactDate" className="text-[15px] font-inter-medium">3rd Contact Date</Label>
          <div className="bg-white rounded-md border">
          <DatePicker 
              date={formData.third_contact_date ? parse(formData.third_contact_date, "dd-MM-yyyy", new Date()) : undefined} 
              setDate={(date) => handleDateChange(date, "third_contact_date")} 
              placeholder="DD-MM-YYYY" 
            />

          </div>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="thirdResponse" className="text-[15px] font-inter-medium">3rd Response</Label>
          <Input id="thirdResponse" name="third_response" value={formData.third_response || ''} onChange={handleChange} placeholder="Please enter 3rd response" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="name" className="text-[15px] font-inter-medium">Notes</Label>
          <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Enter notes..." className="w-full p-2 h-28 border rounded-md bg-white" />
        </div>
      </div>
      <input type="hidden" name="user_id" value={user?.id || ''} />

      <RainbowButton type="submit" className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer `} disabled={isLoading}>
        {isLoading ? (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
        ) : (
            "Add inquiry"
          )}
      </RainbowButton>
      {alertMessage && (
          <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
      )}
    </form>
  )
}

export default InternationalInquiryForm;



