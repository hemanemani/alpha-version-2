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
import { Loader, SquarePlus,SquareX } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton"
import { SkeletonCard } from "@/components/SkeletonCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface InquiryFormData{
  id: number;
  inquiry_number:number;
  mobile_number: string;
  inquiry_date: string | undefined;
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
  select_user:string;
  [key: string]: string | number | null | undefined | Date;


}

interface User {
  id: number;
  name:string;
}

const InquiryForm = () =>
  {
    const router = useRouter();
  
    const [formData, setFormData] = useState<InquiryFormData>({
      id:0,
      inquiry_number: 0,
      mobile_number: '',
      inquiry_date: undefined,
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
      select_user:''
    });

    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileDuplicate, setIsMobileDuplicate] = useState("");
    const [productCategories, setProductCategories] = useState<string[]>(['']);
    const [specificProducts, setspecificProducts] = useState<string[]>(['']);
    const [isInputLoading, setIsInputLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);



    const [formErrors, setFormErrors] = useState({
      inquiry_number: false,
      inquiry_date: false,
      name: false,
      mobile_number: false,
      first_contact_date: false,
      first_response: false,
    });
    

    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === 'name') {
        const onlyLetters = /^[a-zA-Z\s]*$/;
        if (!onlyLetters.test(value)) return;
        if (value.length > 100) return;

      }
      if (name === 'mobile_number') {
        const onlyDigits = /^[0-9]*$/;
        if (!onlyDigits.test(value)) return; 
        if (value.length > 15) return;
      }
      if (name === 'location') {
        const onlyLetters = /^[a-zA-Z\s]*$/;
        if (!onlyLetters.test(value)) return;
        if (value.length > 50) return;
      }
     
    
      setFormData((prev) => ({
        ...prev,
        [name]: name.includes('date') ? new Date(value) : value,
      }));
    };

    const handleDateChange = (date: Date | undefined, field: keyof InquiryFormData) => {
      setFormData((prev) => ({
        ...prev,
        [field]: date ? format(date, "dd-MM-yyyy") : undefined, // ✅ Keep "DD-MM-YYYY" format for backend
      }));
    };
    
    const handleProductCategoryChange = (index: number, value: string) => {
      const updated = [...productCategories];
      updated[index] = value;
      setProductCategories(updated);
    };

    const handleSpecificProductChange = (index: number, value: string) => {
      const updated = [...specificProducts];
      updated[index] = value;
      setspecificProducts(updated);
    };
    
    const addCategoryField = () => {
      setProductCategories([...productCategories, '']);
    };
    const addSpecificProductField = () => {
      setspecificProducts([...specificProducts, '']);
    };
    
    const removeCategoryField = (index: number) => {
      const updated = productCategories.filter((_, i) => i !== index);
      setProductCategories(updated);
    };

    const removeSpecificProductField = (index: number) => {
      const updated = specificProducts.filter((_, i) => i !== index);
      setspecificProducts(updated);
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
          '/inquiries',
          {
            ...formData,
            user_id: user.id,
            product_categories: productCategories.filter(Boolean).join(','),
            specific_product: specificProducts.filter(Boolean).join(',')
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
            setAlertMessage("New Inquiry Added");
            router.push("/inquiries/domestic");
          }, 2000);
          // router.push('/inquiries/domestic');
        } else {
          setAlertMessage("Failed to add inquiry...");
          setIsSuccess(false);
          setIsLoading(false);
          console.error('Failed to add inquiry', response);
        }
      } catch (error: unknown) {
        setIsSuccess(false);
        setIsLoading(false);
        if (error instanceof AxiosError) {
          const backendMessage = error.response?.data?.message;
          if (backendMessage.includes("blocked") || backendMessage?.includes("inquiries") || backendMessage?.includes("orders") || backendMessage?.includes("international_inquiries") || backendMessage?.includes("international_orders")) {
          setIsMobileDuplicate(backendMessage); // store message as-is
          return;
          }
        else {
            setAlertMessage("Something went wrong...");
          }
          console.error('Error Status:', error.response?.status);
          console.error('Error Data:', error.response?.data);
        } else {
          console.error('An unexpected error occurred:', error);
        }      
      }
    };

    useEffect(() => {
      const fetchNextNumber = async () => {
        const token = localStorage.getItem('authToken');
  
        if (!token) {
          console.log('User is not authenticated.');
          return;
        }
        try {
          const res = await axiosInstance.get(
            '/inquiries/next-number',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const nextNumber = res.data.next_inquiry_number;
          setFormData(prev => ({
            ...prev,
            inquiry_number: nextNumber,
          }));
        } catch (error) {
          console.error('Failed to fetch next inquiry number', error);
        }
        finally{
          setIsInputLoading(false);
        }
      };
    
      fetchNextNumber();
    }, []);

    const handleUserSelectChange = (field: string, value: string) => {
        setFormData(prev => ({
          ...prev,
          [field]: value,
        }));
      };
    
    
    useEffect(() => {
      const fetchUsers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      try {
        const response = await axiosInstance.get<User[]>('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response && response.data) {
          const processedData = response.data.map((item) => ({
            ...item,
            
          }));
          setUsers(processedData);
        } else {
          console.error('Failed to fetch users', response.status);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    }
        
      fetchUsers();
    }, []);

    
  
    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryNumber" className="text-[15px] font-inter-medium">Inquiry Number</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Input id="inquiryNumber" name="inquiry_number" value={formData.inquiry_number || ''} placeholder="Please enter inquiry number" onChange={handleChange} className={`bg-white ${formErrors.inquiry_number ? "border-red-500" : ""}`} readOnly /> }
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryDate" className="text-[15px] font-inter-medium">Inquiry Date</Label>
            <div className={`bg-white rounded-md ${formErrors.inquiry_date ? "border border-red-500" : ""}`}>
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
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter customer name" className={`bg-white ${formErrors.name ? "border-red-500" : "border"}`}/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="mobileNumber" className="text-[15px] font-inter-medium">Mobile Number</Label>
            <Input id="mobileNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter mobile number" className={`bg-white ${formErrors.mobile_number || isMobileDuplicate ? "border-red-500" : "border"}`} />
            {(isMobileDuplicate) && (
                <p className="text-red-600 text-[13px] font-medium mt-1">{isMobileDuplicate}</p>
            )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="location" className="text-[15px] font-inter-medium">Location (City)</Label>
            <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Please enter city name" className="bg-white border" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="productCategories" className="text-[15px] font-inter-medium">
              Product Categories
            </Label>

            {productCategories.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  id={`productCategory-${index}`}
                  value={category}
                  onChange={(e) => handleProductCategoryChange(index, e.target.value)}
                  placeholder="Please enter product category"
                  className="bg-white border w-[80%]"
                />
                <div className="flex gap-1">
                  {index === productCategories.length - 1 && (
                    <button
                      type="button"
                      onClick={addCategoryField}
                      className="text-green-500 text-lg cursor-pointer"
                      title="Add More"
                    >
                    <SquarePlus className="h-6 w-6 text-green-800" />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeCategoryField(index)}
                      className="text-red-500 text-lg cursor-pointer"
                      title="Remove"
                    >
                      <SquareX className="h-6 w-6 text-red-800" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="specificProduct" className="text-[15px] font-inter-medium">Specific Product</Label>
            {specificProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  id={`specificProduct-${index}`}
                  value={product}
                  onChange={(e) => handleSpecificProductChange(index, e.target.value)}
                  placeholder="Please enter specific product"
                  className="bg-white border w-[80%]"
                />
                <div className="flex gap-1">
                  {index === specificProducts.length - 1 && (
                    <button
                      type="button"
                      onClick={addSpecificProductField}
                      className="text-green-500 text-lg cursor-pointer"
                      title="Add More"
                    >
                    <SquarePlus className="h-6 w-6 text-green-800" />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSpecificProductField(index)}
                      className="text-red-500 text-lg cursor-pointer"
                      title="Remove"
                    >
                      <SquareX className="h-6 w-6 text-red-800" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryThrough" className="text-[15px] font-inter-medium">Inquiry Through</Label>
            <Input id="inquiryThrough" name="inquiry_through" value={formData.inquiry_through || ''} onChange={handleChange} placeholder="Please enter inquiry through" className="bg-white border"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryReference" className="text-[15px] font-inter-medium">Inquiry Reference</Label>
            <Input id="inquiryReference" name="inquiry_reference" value={formData.inquiry_reference || ''} onChange={handleChange} placeholder="Please enter inquiry reference" className="bg-white border" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstContactDate" className="text-[15px] font-inter-medium">1st Contact Date</Label>
            <div className={`bg-white rounded-md ${formErrors.first_contact_date ? "border border-red-500" : ""}`}>
            <DatePicker 
              date={formData.first_contact_date ? parse(formData.first_contact_date, "dd-MM-yyyy", new Date()) : undefined} 
              setDate={(date) => handleDateChange(date, "first_contact_date")} 
              placeholder="DD-MM-YYYY" 
            />

            </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstResponse" className="text-[15px] font-inter-medium">1st Response</Label>
            <Input id="firstResponse" name="first_response" value={formData.first_response || ''} onChange={handleChange} placeholder="Please enter 1st response" className={`bg-white ${formErrors.first_response ? "border-red-500" : "border"}`} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondContactDate" className="text-[15px] font-inter-medium">2nd Contact Date</Label>
            <div className="bg-white rounded-md">
            <DatePicker 
            date={formData.second_contact_date ? parse(formData.second_contact_date, "dd-MM-yyyy", new Date()) : undefined} 
            setDate={(date) => handleDateChange(date, "second_contact_date")} 
              placeholder="DD-MM-YYYY" 
            />

            </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondResponse" className="text-[15px] font-inter-medium">2nd Response</Label>
            <Input id="secondResponse" name="second_response" value={formData.second_response || ''} onChange={handleChange} placeholder="Please enter 2nd response" className="bg-white border" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdContactDate" className="text-[15px] font-inter-medium">3rd Contact Date</Label>
            <div className="bg-white rounded-md">
            <DatePicker 
                date={formData.third_contact_date ? parse(formData.third_contact_date, "dd-MM-yyyy", new Date()) : undefined} 
                setDate={(date) => handleDateChange(date, "third_contact_date")} 
                placeholder="DD-MM-YYYY" 
              />

            </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdResponse" className="text-[15px] font-inter-medium">3rd Response</Label>
            <Input id="thirdResponse" name="third_response" value={formData.third_response || ''} onChange={handleChange} placeholder="Please enter 3rd response" className="border bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px] font-inter-medium">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Enter notes..." className="w-full p-2 h-28 border rounded-md bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="select_user" className="text-[15px] font-inter-medium">Managed By</Label>
            <Select 
              name="select_user" 
              value={formData.select_user || user?.id?.toString() || ''}
              onValueChange={(value: string) => handleUserSelectChange('select_user', value)}
            >
              <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-[13px] cursor-pointer" value="select user">
                  Select User
                </SelectItem>
                {users?.map((item) => (
                  <SelectItem 
                    key={item.id} 
                    value={item.id.toString()}
                    className="text-[13px] cursor-pointer"
                  >
                    {item.name}
                    {item.id === user?.id && " (Current User)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>     
            </div>
        </div>
        <input type="hidden" name="user_id" value={user?.id || ''} />
        
        <RainbowButton 
         type="submit"
         className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer `}
         disabled={isLoading}
         >
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

export default InquiryForm;


