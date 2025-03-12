"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import moment from 'moment';
import { AxiosError } from 'axios';
import CustomDateInput from "@/components/ui/customdateinput";
import StatusSelect from "@/components/ui/statusselect";


interface EditInternationalInquiryFormData{
  id: number;
  inquiry_number:number;
  mobile_number: string;
  inquiry_date: Date | undefined;
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
  offer_data?: {
    offer_number: string;
    communication_date: string | null;
    received_sample_amount: string | null;
    sample_dispatched_date: string | null;
    sample_sent_through: string | null;
    sample_received_date: string | null;
    offer_notes: string | null;
  };


}

interface OfferData {
  offer_number: string;
  communication_date: string;
  received_sample_amount: string;
  sample_dispatched_date: string;
  sample_sent_through: string;
  sample_received_date: string;
  offer_notes: string;
  inquiry_id: string;
}


interface User {
  id: number;
}

const EditInternationalInquiryForm =  () =>
  {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null);

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
      inquiry_id: '',
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
              inquiry_date: inquiryData.inquiry_date ? new Date(inquiryData.inquiry_date) : undefined,
              first_contact_date: inquiryData.first_contact_date ? new Date(inquiryData.first_contact_date) : undefined,
              second_contact_date: inquiryData.second_contact_date ? new Date(inquiryData.second_contact_date) : undefined,
              third_contact_date: inquiryData.third_contact_date ? new Date(inquiryData.third_contact_date) : undefined,
            };
            setFormData(parsedInquiry);
            if (response.data.international_offers.length > 0) {
              setOfferData(response.data.international_offers[0]); // Select the first offer
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      const formattedInquiryDate = formData.inquiry_date ? moment(formData.inquiry_date, 'YYYY-MM-DD').format('DD-MM-YYYY') : '';
      const formattedFirstDate = formData.first_contact_date ? moment(formData.first_contact_date, 'YYYY-MM-DD').format('DD-MM-YYYY') : '';
      const formattedSecondDate = formData.second_contact_date
        ? moment(formData.second_contact_date, 'YYYY-MM-DD').format('DD-MM-YYYY')
        : '';
      const formattedThirdDate = formData.third_contact_date
        ? moment(formData.third_contact_date, 'YYYY-MM-DD').format('DD-MM-YYYY')
        : '';
  
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
          inquiry_date: formattedInquiryDate,
          first_contact_date: formattedFirstDate,
          second_contact_date: formattedSecondDate,
          third_contact_date: formattedThirdDate,
          user_id: user.id,
        };
  
        if (formData.status === 1) {
          requestData['offer_data'] = {
            offer_number: offerData.offer_number,
            communication_date: offerData.communication_date || null,
            received_sample_amount: offerData.received_sample_amount || null,
            sample_dispatched_date: offerData.sample_dispatched_date || null,
            sample_sent_through: offerData.sample_sent_through || null,
            sample_received_date: offerData.sample_received_date || null,
            offer_notes: offerData.offer_notes || null,
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
          router.push(formData.status === 1 ? '/offers/domestic' : '/inquiries/domestic');
        } else {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryNumber" className="text-[15px]">Inquiry Number</Label>
            <Input id="inquiryNumber" name="inquiry_number" value={formData.inquiry_number || ''} placeholder="Please enter inquiry number" onChange={handleChange} className="bg-white"/>
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="inquiryDate" className="text-[15px]">Inquiry Date</Label>
              <CustomDateInput
                  id="inquiryDate"
                  name="inquiry_date"
                  value={formData.inquiry_date}
                  onChange={(id, name, date) => setFormData((prev) => ({ ...prev, [name]: date }))}
                />
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
              <CustomDateInput
                  id="firstContactDate"
                  name="first_contact_date"
                  value={formData.first_contact_date}
                  onChange={(id, name, date) => setFormData((prev) => ({ ...prev, [name]: date }))}
                />
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="firstResponse" className="text-[15px]">1st Response</Label>
            <Input id="firstResponse" name="first_response" value={formData.first_response || ''} onChange={handleChange} placeholder="Please enter 1st response" className="bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondContactDate" className="text-[15px]">2nd Contact Date</Label>
            <CustomDateInput
                  id="secondContactDate"
                  name="second_contact_date"
                  value={formData.second_contact_date}
                  onChange={(id, name, date) => setFormData((prev) => ({ ...prev, [name]: date }))}
                />
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="secondResponse" className="text-[15px]">2nd Response</Label>
            <Input id="secondResponse" name="second_response" value={formData.second_response || ''} onChange={handleChange} placeholder="Please enter 2nd response" className="bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="thirdContactDate" className="text-[15px]">3rd Contact Date</Label>
            <CustomDateInput
                  id="thirdContactDate"
                  name="third_contact_date"
                  value={formData.third_contact_date}
                  onChange={(id, name, date) => setFormData((prev) => ({ ...prev, [name]: date }))}
                />
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
      </form>
    
    
  )
}

export default EditInternationalInquiryForm;