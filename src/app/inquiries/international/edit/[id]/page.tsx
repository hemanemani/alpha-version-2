"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import StatusSelect from "@/components/ui/statusselect";
import AlertMessages from "@/components/AlertMessages";
import { DatePicker } from "@/components/date-picker";
import { format } from "date-fns";


interface OfferData {
  offer_number: string;
  communication_date: string | undefined;
  received_sample_amount: string;
  sample_dispatched_date: string | undefined;
  sample_sent_through: string;
  sample_received_date: string | undefined;
  offer_notes: string;
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
  first_contact_date: Date | undefined;
  first_response: string;
  second_contact_date: Date | undefined;
  second_response: string;
  third_contact_date: Date | undefined;
  third_response: string;
  notes: string;
  user_id?: string;
  status: number;
  offer_data?: OfferData
}

interface User {
  id: number;
}

const EditInternationalInquiryForm =  () =>
  {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);


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
      status: 2

    });
    const [offerData, setOfferData] = useState<OfferData>({
      offer_number: '',
      communication_date: '',
      received_sample_amount: '',
      sample_dispatched_date: '',
      sample_sent_through: '',
      sample_received_date: '',
      offer_notes: '',
      international_inquiry_id: 0,
    });
  
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, []);

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

            const parsedInquiry: EditInternationalInquiryFormData = {
              ...inquiryData,
            };
      
      
            setFormData(parsedInquiry);

            const fetchedOffers = response.data.international_offers;
            if (fetchedOffers.length > 0) {            
              setOfferData(fetchedOffers[0]);
              }
          } catch (error) {
            console.error('Error fetching item:', error);
          }
        };
        fetchItem();
      }
    }, [id]);
  

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    
      const token = localStorage.getItem('authToken');
      if (!token || !user) {
        console.log('User is not authenticated.');
        return;
      }
  
      try {
        const url = id ? `international_inquiries/${id}` : 'international_inquiries';
        const method = id ? 'put' : 'post';
  
        const requestData = {
          ...formData,
          user_id: user.id,
        };
  
        if (formData.status === 1) {
          requestData['offer_data'] = {
            offer_number: offerData.offer_number,
            international_inquiry_id: offerData.international_inquiry_id, 
            communication_date: offerData.communication_date,
            received_sample_amount: offerData.received_sample_amount,
            sample_dispatched_date: offerData.sample_dispatched_date,
            sample_sent_through: offerData.sample_sent_through,
            sample_received_date: offerData.sample_received_date,
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
          setAlertMessage("International Inquiry Updated");
          setIsSuccess(true);
          setTimeout(() =>router.push(formData.status === 1 ? '/offers/international' : '/inquiries/international'), 2000);
          // router.push(formData.status === 1 ? '/offers/international' : '/inquiries/international');
        } else {
          setAlertMessage(`${id ? 'Failed to edit' : 'Failed to add'} international inquiry`);
          setIsSuccess(false);    
          console.error(`${id ? 'Failed to edit' : 'Failed to add'} international inquiry`, response);
        }
      } catch (error: unknown) {
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

             
      {formData.status === 1 && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="offerNumber" className="text-[15px]">Offer Number</Label>
                  <Input id="offerNumber" name="offer_number" value={offerData.offer_number || ''} placeholder="Please enter offer number" onChange={handleChange} className="bg-white" />
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="communicationDate" className="text-[15px]">Communication Date</Label>
                  <div className="bg-white rounded-md border">
                    <DatePicker 
                        date={offerData.communication_date ? new Date(offerData.communication_date) : undefined} // Convert "YYYY-MM-DD" → Date
                        setDate={(date) => handleOfferDateChange(date, "communication_date")} // ✅ Correct way to pass the field
                        placeholder="DD-MM-YYYY" 
                      />

                  </div>
                </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="receivedSampleAmount" className="text-[15px]">Received Sample Amount (in Rs.)</Label>
                  <Input id="receivedSampleAmount" name="received_sample_amount" value={offerData.received_sample_amount || ''} placeholder="Enter amount" onChange={handleChange} className="bg-white" />
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sampleDispatchedDate" className="text-[15px]">Sample Dispatched Date</Label>
                  <div className="bg-white rounded-md border">
                    <DatePicker 
                      date={offerData.sample_dispatched_date ? new Date(offerData.sample_dispatched_date) : undefined} 
                      setDate={(date) => handleOfferDateChange(date, "sample_dispatched_date")} 
                      placeholder="DD-MM-YYYY" 
                    />

                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sampleSentThrough" className="text-[15px]">Sample Sent Through</Label>
                  <Input id="sampleSentThrough" name="sample_sent_through" value={offerData.sample_sent_through || ''} placeholder="Enter sample sent through" onChange={handleChange} className="bg-white" />
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sampleReceivedDate" className="text-[15px]">Sample Received Date</Label>
                  <div className="bg-white rounded-md border">
                    <DatePicker 
                      date={offerData.sample_received_date ? new Date(offerData.sample_received_date) : undefined} 
                      setDate={(date) => handleOfferDateChange(date, "sample_received_date")} 
                      placeholder="DD-MM-YYYY" 
                    />

                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">

                <div className="col-span-2 space-y-2 w-[80%]">
                  <Label htmlFor="offerNotes" className="text-[15px]">Offer Notes</Label>
                  <Textarea id="offerNotes" name="offer_notes" value={offerData.offer_notes || ''} placeholder="Enter offer notes" onChange={handleChange} className="bg-white" rows={4} />
                </div>
              </div>
            </>
          )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryNumber" className="text-[15px]">Inquiry Number</Label>
            <Input id="inquiryNumber" name="inquiry_number" value={formData.inquiry_number || ''} placeholder="Please enter inquiry number" onChange={handleChange} className="bg-white"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryDate" className="text-[15px]">Inquiry Date</Label>
              <div className="bg-white rounded-md border">
              <DatePicker 
                  date={formData.inquiry_date ? new Date(formData.inquiry_date) : undefined} 
                  setDate={(date) => handleInquiryDateChange(date, "inquiry_date")} 
                  placeholder="DD-MM-YYYY" 
                />
                </div>
          </div>
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px]">Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter customer name" className="bg-white"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="mobileNumber" className="text-[15px]">Mobile Number</Label>
            <Input id="mobileNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter mobile number" className="bg-white"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="location" className="text-[15px]">Location (City)</Label>
            <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Please enter city name" className="bg-white"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="productCategories" className="text-[15px]">Product Categories</Label>
            <Input id="productCategories" name="product_categories" value={formData.product_categories || ''} onChange={handleChange} placeholder="Please enter product categories" className="bg-white"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="specificProduct" className="text-[15px]">Specific Product</Label>
            <Input id="specificProduct" name="specific_product" value={formData.specific_product || ''} onChange={handleChange} placeholder="Please enter name of specific products" className="bg-white"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryThrough" className="text-[15px]">Inquiry Through</Label>
            <Input id="inquiryThrough" name="inquiry_through" value={formData.inquiry_through || ''} onChange={handleChange} placeholder="Please enter inquiry through" className="bg-white"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryReference" className="text-[15px]">Inquiry Reference</Label>
            <Input id="inquiryReference" name="inquiry_reference" value={formData.inquiry_reference || ''} onChange={handleChange} placeholder="Please enter inquiry reference" className="bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstContactDate" className="text-[15px]">1st Contact Date</Label>
              <div className="bg-white rounded-md border">
              <DatePicker 
                  date={formData.first_contact_date ? new Date(formData.first_contact_date) : undefined} 
                  setDate={(date) => handleInquiryDateChange(date, "first_contact_date")} 
                  placeholder="DD-MM-YYYY" 
                />

                </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstResponse" className="text-[15px]">1st Response</Label>
            <Input id="firstResponse" name="first_response" value={formData.first_response || ''} onChange={handleChange} placeholder="Please enter 1st response" className="bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondContactDate" className="text-[15px]">2nd Contact Date</Label>
              <div className="bg-white rounded-md border">
              <DatePicker 
                  date={formData.second_contact_date ? new Date(formData.second_contact_date) : undefined} 
                  setDate={(date) => handleInquiryDateChange(date, "second_contact_date")} 
                  placeholder="DD-MM-YYYY" 
                />
              </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondResponse" className="text-[15px]">2nd Response</Label>
            <Input id="secondResponse" name="second_response" value={formData.second_response || ''} onChange={handleChange} placeholder="Please enter 2nd response" className="bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdContactDate" className="text-[15px]">3rd Contact Date</Label>
              <div className="bg-white rounded-md border">
              <DatePicker 
                date={formData.third_contact_date ? new Date(formData.third_contact_date) : undefined} 
                setDate={(date) => handleInquiryDateChange(date, "third_contact_date")} 
                placeholder="DD-MM-YYYY" 
              />

              </div>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdResponse" className="text-[15px]">3rd Response</Label>
            <Input id="thirdResponse" name="third_response" value={formData.third_response || ''} onChange={handleChange} placeholder="Please enter 3rd response" className="bg-white" />
          </div>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px]">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Enter notes..." className="w-full p-2 h-36 border rounded-xl bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="selectStatus" className="text-[15px]">Select Status</Label>
            <StatusSelect value={formData.status.toString()} onChange={(val) => setFormData({ ...formData, status: parseInt(val) })} />
          </div>
         
        </div>


        <Button type="submit" className="w-[40%] bg-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-[500] cursor-pointer">Add inquiry</Button>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
      </form>
    
    
  )
}

export default EditInternationalInquiryForm;