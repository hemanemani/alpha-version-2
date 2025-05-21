"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { DatePicker } from "@/components/date-picker";
import { format } from "date-fns";
import { Loader, SquarePlus,SquareX } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface OfferData {
  offer_number: number;
  offer_date: string | undefined;
  communication_date: string | undefined;
  received_sample_amount: string;
  sample_dispatched_date: string | undefined;
  sent_sample_amount: number;
  sample_sent_through: string;
  sample_received_date: string | undefined;
  offer_notes: string;
  sample_send_address:string;
  international_inquiry_id?: number;
}



interface EditInternationalInquiryFormData{
  id: number;
  inquiry_number:number;
  mobile_number: string;
  inquiry_date: string | undefined;
  product_categories: string;
  specific_product: string;
  name: string;
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
  status: number | null;
  offer_data?: OfferData;
  offers_status?:number | null;
  select_user:string;
}

interface User {
  id: number;
  name:string;
}

const EditInternationalInquiryForm =  () =>
  {
    const router = useRouter();
    const { id } = useParams<{ id: string }>() ?? {};
    const [user, setUser] = useState<User | null>(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInputLoading, setIsInputLoading] = useState(true);
    const [productCategories, setProductCategories] = useState<string[]>(['']);
    const [specificProducts, setspecificProducts] = useState<string[]>(['']);
    const [wasOfferMode, setWasOfferMode] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("placeholder");  
    const [users, setUsers] = useState<User[]>([]);


    const [formData, setFormData] = useState<EditInternationalInquiryFormData>({
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
      status: 2,
      select_user:''
    });
    const [offerData, setOfferData] = useState<OfferData>({
      offer_number: 0,
      offer_date:undefined,
      communication_date: undefined,
      received_sample_amount: '',
      sent_sample_amount:0,
      sample_dispatched_date: undefined,
      sample_sent_through: '',
      sample_received_date: undefined,
      offer_notes: '',
      sample_send_address:"",
      international_inquiry_id: 0,
    });
  
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, []);

    useEffect(() => {
      if (formData.status === 1) {
        setWasOfferMode(true);
      }
    }, [formData.status]);

    useEffect(() => {
      if (formData.offers_status === 1) {
        setSelectedStatus("order");
      } else if (formData.status === 1) {
        setSelectedStatus("offer");
      } else if (formData.status === 0) {
        setSelectedStatus("cancel");
      } else {
        setSelectedStatus("placeholder");
      }
    }, [formData]);
    
    const handleSelectChange = (value: string) => {
      setSelectedStatus(value);
    };

    useEffect(() => {
      if (id) {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No token found in localStorage');
          return;
        }
        const fetchItem = async () => {
          try {
            const response = await axiosInstance.get<{ international_inquiry: EditInternationalInquiryFormData; international_offers: OfferData[] }>(
              `international-inquiries/${id}/with-offers`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            const inquiryData = response.data.international_inquiry;
            setFormData(inquiryData);

            if (inquiryData.product_categories) {
              setProductCategories(inquiryData.product_categories.split(','));
              setspecificProducts(inquiryData.specific_product.split(','));
            }
      

            const fetchedOffers = response.data.international_offers;
            if (fetchedOffers.length > 0) {            
              setOfferData(fetchedOffers[0]);
              }
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
  

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (name === 'first_response' || name === 'second_response' || name === 'third_response' ) {
        const alphanumericRegex = /^[a-zA-Z0-9\s]*$/;
        if (!alphanumericRegex.test(value)) return;
        if (value.length > 100) return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setOfferData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleInquiryDateChange = (date: Date | undefined, field: keyof EditInternationalInquiryFormData) => {
      setFormData((prev) => ({
        ...prev,
        [field]: date ? format(date, "yyyy-MM-dd") : undefined, // ✅ Store as "YYYY-MM-DD" format
      }));
    };
    const handleOfferDateChange = (date: Date | undefined, field: keyof OfferData) => {
      setOfferData((prev) => ({
        ...prev,
        [field]: date ? format(date, "yyyy-MM-dd") : undefined, // ✅ Store as "YYYY-MM-DD" format
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
    
      const token = localStorage.getItem('authToken');
      if (!token || !user) {
        console.log('User is not authenticated.');
        return;
      }
  
      try {
        setIsLoading(true);
        const url = id ? `international_inquiries/${id}` : 'international_inquiries';
        const method = id ? 'put' : 'post';

        let status = formData.status;
        let offers_status = formData.offers_status;

    
        switch (selectedStatus) {
          case "offer":
            status = 1;
            break;
          case "cancel":
            status = 0;
            break;
          case "order":
            offers_status = 1;
            break;
        }
  
        const requestData = {
          ...formData,
          user_id: user.id,
          product_categories: productCategories.filter(Boolean).join(','),
          specific_product: specificProducts.filter(Boolean).join(','),
          status:status,
          offers_status:offers_status

        };

        console.log(requestData)
  
        if (formData.status === 1 || wasOfferMode) {
          requestData['offer_data'] = {
            // offer_number: formData.inquiry_number,
            offer_number:offerData.offer_number,
            offer_date: offerData.offer_date,
            international_inquiry_id: offerData.international_inquiry_id, 
            communication_date: offerData.communication_date,
            received_sample_amount: offerData.received_sample_amount,
            sent_sample_amount:offerData.sent_sample_amount,
            sample_dispatched_date: offerData.sample_dispatched_date,
            sample_sent_through: offerData.sample_sent_through,
            sample_received_date: offerData.sample_received_date,
            sample_send_address:offerData.sample_send_address,
            offer_notes: offerData.offer_notes,
          };
        }
  
        const response = await axiosInstance({
          method: method,
          url: url,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: requestData,
        });

        if (response) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsLoading(false);
            setAlertMessage("International Inquiry Updated");
            router.push((formData.status === 1 || wasOfferMode) ? '/offers/international' : '/inquiries/international');
          }, 2000);
        }else {
          setAlertMessage(`${id ? 'Failed to edit' : 'Failed to add'} international inquiry`);
          setIsSuccess(false);
          setIsLoading(false);    
          console.error(`${id ? 'Failed to edit' : 'Failed to add'} international inquiry`, response);
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

             
      {(formData.status === 1 || wasOfferMode ) && (
        <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="offerNumber" className="text-[15px] font-inter-medium">Offer Number</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Input id="offerNumber" name="offer_number" value={offerData.offer_number} placeholder="Please enter offer number" onChange={handleChange} className="bg-white" readOnly /> }
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
              <div className="space-y-2 w-[80%]">
                  <Label htmlFor="offerDate" className="text-[15px] font-inter-medium">Offer Date</Label>
                  <div className="bg-white rounded-md">
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <DatePicker 
                        date={offerData.offer_date ? new Date(offerData.offer_date) : undefined}
                        setDate={(date) => handleOfferDateChange(date, "offer_date")}
                        placeholder="DD-MM-YYYY" 
                      />
                  }
                  </div>
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="communicationDate" className="text-[15px] font-inter-medium">Communication Date</Label>
                  <div className="bg-white rounded-md">
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <DatePicker 
                        date={offerData.communication_date ? new Date(offerData.communication_date) : undefined} // Convert "YYYY-MM-DD" → Date
                        setDate={(date) => handleOfferDateChange(date, "communication_date")} // ✅ Correct way to pass the field
                        placeholder="DD-MM-YYYY" 
                      />
                  }
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="receivedSampleAmount" className="text-[15px] font-inter-medium">Received Sample Amount (in Rs.)</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Input id="receivedSampleAmount" type="number" name="received_sample_amount" value={offerData.received_sample_amount || ''} placeholder="Please enter amount" onChange={handleChange} className="bg-white border" /> }
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sentSampleAmount" className="text-[15px] font-inter-medium">Sent Sample Amount (in Rs.)</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Input id="sentSampleAmount" type="number" name="sent_sample_amount" value={offerData.sent_sample_amount || ''} placeholder="Please enter amount" onChange={handleChange} className="bg-white border" /> }
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sampleSendAddress" className="text-[15px] font-inter-medium">Sample Send Address</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Textarea id="sampleSendAddress" name="sample_send_address" value={offerData.sample_send_address || ''} placeholder="Enter sample send address" onChange={handleChange} className="w-full p-2 h-28 border rounded-md bg-white" rows={4} /> }
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sampleDispatchedDate" className="text-[15px] font-inter-medium">Sample Dispatched Date</Label>
                  <div className="bg-white rounded-md">
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <DatePicker 
                      date={offerData.sample_dispatched_date ? new Date(offerData.sample_dispatched_date) : undefined} 
                      setDate={(date) => handleOfferDateChange(date, "sample_dispatched_date")} 
                      placeholder="DD-MM-YYYY" 
                    />
                  }
                  {offerData.sample_dispatched_date && (  
                    <div className="mt-4">
                      <Label htmlFor="sampleReceivedDate" className="text-[15px] font-inter-medium">Sample Delivery Date</Label>
                      <div className="bg-white rounded-md">
                      { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <DatePicker 
                          date={offerData.sample_received_date ? new Date(offerData.sample_received_date) : undefined} 
                          setDate={(date) => handleOfferDateChange(date, "sample_received_date")} 
                          placeholder="DD-MM-YYYY" 
                        />
                      }
                      </div>
                    </div>
                  )}
                  </div>  
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sampleSentThrough" className="text-[15px] font-inter-medium">Sample Sent Through</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Input id="sampleSentThrough" name="sample_sent_through" value={offerData.sample_sent_through || ''} placeholder="Enter sample sent through" onChange={handleChange} className="bg-white border" /> }
                </div>    
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="offerNotes" className="text-[15px] font-inter-medium">Notes</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> : <Textarea id="offerNotes" name="offer_notes" value={offerData.offer_notes || ''} placeholder="Enter offer notes" onChange={handleChange} className="w-full p-2 h-28 border rounded-md bg-white" rows={4} /> }
                </div>
              </div>

        </>
          )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryNumber" className="text-[15px] font-inter-medium">Inquiry Number</Label> 
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
            ) : (
              <Input
                id="inquiryNumber"
                name="inquiry_number"
                value={formData.inquiry_number || ''}
                placeholder="Please enter inquiry number"
                onChange={handleChange}
                className="bg-white"
                readOnly
              />
            )}
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryDate" className="text-[15px] font-inter-medium">Inquiry Date</Label>
              <div className="bg-white rounded-md">
                {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (
                <DatePicker 
                    date={formData.inquiry_date ? new Date(formData.inquiry_date) : undefined} 
                    setDate={(date) => handleInquiryDateChange(date, "inquiry_date")} 
                    placeholder="DD-MM-YYYY" 
                  />
                )}
                </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
              <Label htmlFor="name" className="text-[15px] font-inter-medium">Name</Label>
              {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                  ) : (
                    <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter customer name" className="bg-white border"/>
              )}
            </div>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="mobileNumber" className="text-[15px] font-inter-medium">Mobile Number</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />) : (
            <Input id="mobileNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter mobile number" className="bg-white border"/>
          )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="location" className="text-[15px] font-inter-medium">Location (City)</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (
              <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Please enter city name" className="bg-white border"/>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="productCategories" className="text-[15px] font-inter-medium">
              Product Categories
            </Label>

            {productCategories.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (
                <Input
                  id={`productCategory-${index}`}
                  value={category}
                  onChange={(e) => handleProductCategoryChange(index, e.target.value)}
                  placeholder="Please enter product category"
                  className="bg-white border w-[80%]"
                />
              )}

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
                {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

                <Input
                  id={`specificProduct-${index}`}
                  value={product}
                  onChange={(e) => handleSpecificProductChange(index, e.target.value)}
                  placeholder="Please enter specific product"
                  className="bg-white border w-[80%]"
                />
                )}
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

        {(formData.status !== 1 && !(wasOfferMode)) && (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryThrough" className="text-[15px] font-inter-medium">Inquiry Through</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

            <Input id="inquiryThrough" name="inquiry_through" value={formData.inquiry_through || ''} onChange={handleChange} placeholder="Please enter inquiry through" className="bg-white border"/>
                )}
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryReference" className="text-[15px] font-inter-medium">Inquiry Reference</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

            <Input id="inquiryReference" name="inquiry_reference" value={formData.inquiry_reference || ''} onChange={handleChange} placeholder="Please enter inquiry reference" className="bg-white border" />
                )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstContactDate" className="text-[15px] font-inter-medium">1st Contact Date</Label>
              <div className="bg-white rounded-md">
              {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

              <DatePicker 
                  date={formData.first_contact_date ? new Date(formData.first_contact_date) : undefined} 
                  setDate={(date) => handleInquiryDateChange(date, "first_contact_date")} 
                  placeholder="DD-MM-YYYY" 
                />
                )}
                </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstResponse" className="text-[15px] font-inter-medium">1st Response</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

            <Input id="firstResponse" name="first_response" value={formData.first_response || ''} onChange={handleChange} placeholder="Please enter 1st response" className="bg-white border" />
                )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondContactDate" className="text-[15px] font-inter-medium">2nd Contact Date</Label>
              <div className="bg-white rounded-md">
              {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

              <DatePicker 
                  date={formData.second_contact_date ? new Date(formData.second_contact_date) : undefined} 
                  setDate={(date) => handleInquiryDateChange(date, "second_contact_date")} 
                  placeholder="DD-MM-YYYY" 
                />
                )}
              </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondResponse" className="text-[15px] font-inter-medium">2nd Response</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

            <Input id="secondResponse" name="second_response" value={formData.second_response || ''} onChange={handleChange} placeholder="Please enter 2nd response" className="bg-white border" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdContactDate" className="text-[15px] font-inter-medium">3rd Contact Date</Label>
              <div className="bg-white rounded-md">
              {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

              <DatePicker 
                date={formData.third_contact_date ? new Date(formData.third_contact_date) : undefined} 
                setDate={(date) => handleInquiryDateChange(date, "third_contact_date")} 
                placeholder="DD-MM-YYYY" 
              />
                )}
              </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdResponse" className="text-[15px] font-inter-medium">3rd Response</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

            <Input id="thirdResponse" name="third_response" value={formData.third_response || ''} onChange={handleChange} placeholder="Please enter 3rd response" className="border bg-white" />
                )}
          </div>
        </div>
       
        
        
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px] font-inter-medium">Notes</Label>
            {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (

            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Enter notes..." className="w-full p-2 h-36 border rounded-md bg-white" />
                )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="selectStatus" className="text-[15px] font-inter-medium">Select Status</Label>
              <Select name="status" value={selectedStatus} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>Select Status</SelectItem>

                  {formData.status !== 1 && !wasOfferMode ? (
                    <>
                      <SelectItem value="offer">Move to Offers</SelectItem>
                      <SelectItem value="cancel">Move to Cancel</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="order">Ordered</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
          </div>
          

        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="select_user" className="text-[15px] font-inter-medium">Managed By</Label>
            <Select 
              name="select_user" 
              value={formData.select_user || ''}
              onValueChange={(value: string) => handleUserSelectChange('select_user', value)}
            >
              {isInputLoading ? ( <SkeletonCard height="h-[36px]" />
                ) : (
                <>
                  <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent> 
                    <SelectItem value="placeholder" disabled>
                      Select User
                    </SelectItem>
                    {users?.map((item) => (
                      
                      <SelectItem 
                        key={item.id} 
                        value={item.id.toString()}
                        className="cursor-pointer"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </>
                )}
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
            "Update inquiry"
          )}
        </RainbowButton>

        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
      </form>
    
  )
}

export default EditInternationalInquiryForm;