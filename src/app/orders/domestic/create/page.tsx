"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { DatePicker } from "@/components/date-picker";
import { Loader, Trash2 } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";
import { OrderItem } from "@/types/order";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SellerShippingDetailsItem } from "@/types/sellershippingdetails";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import {ProductData}  from "@/types/orderproduct";
import React from "react";
import { SellerDetailsData } from "@/types/sellerdetails";

type Seller = {
  id:number;
  name : string;
  pickup_address : string;
  mobile_number : string;
}

interface User {
  id: string;
}


const OrderForm =  () =>
  {
    const router = useRouter();
    const { id } = useParams<{ id: string }>() ?? {};

    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
    const [isInputLoading, setIsInputLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({
      seller_assigned : false,
      name:false,
      mobile_number:false,
    });

    const [formData, setFormData] = useState<OrderItem>({
      id: 0,
      order_number: 0,
      name: '',
      mobile_number: '',
      seller_assigned: '',
      sellerdetails: [],
      buyer_gst_number: '',
      buyer_pan: '',
      buyer_bank_details: '',
      amount_received: 0,
      amount_received_date: '',
      amount_paid: 0,
      amount_paid_date: '',
      logistics_through: '',
      logistics_agency: '',
      buyer_final_shipping_value: 0,
      buyer_total_amount:0,
      shipping_estimate_value: 0,
      user: { name: '' },
      user_id: 0,
      sellers: [],
      offer: undefined,
      offers: [],
      international_sellers: [],
      international_offer: undefined,
      international_offers: [],
    });


    const [formDataArray, setFormDataArray] = useState<SellerShippingDetailsItem[]>([]);

    const [user, setUser] = useState<User | null>(null);
        useEffect(() => {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }, []);

    useEffect(() => {
      const fetchNextNumber = async () => {
        const token = localStorage.getItem('authToken');
  
        if (!token) {
          console.log('User is not authenticated.');
          return;
        }
        try {
          const res = await axiosInstance.get(
            '/orders/next-number',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const nextNumber = res.data.next_order_number;
          setFormData(prev => ({
            ...prev,
            order_number: nextNumber,
          }));
        } catch (error) {
          console.error('Failed to fetch next order number', error);
        }finally{
          setIsInputLoading(false);
        }
      };
    
      fetchNextNumber();
    }, []);

    useEffect(() => {
      const fetchSellers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
  
      try {
        const response = await axiosInstance.get('/seller-details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response && response.data) {
          setSellers(response.data);  
        } else {
          console.error('Failed to fetch sellers', response.status);
        }
      } catch (error) {
        console.error('Error fetching sellers:', error);
      } finally {
        setIsLoading(false);
      }
    }
        
    fetchSellers();
    }, []);
  

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const newFormErrors = {
        seller_assigned: !formData.seller_assigned,
        name: !formData.name,
        mobile_number: !formData.mobile_number
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
        const url = id ? `orders/${id}` : 'orders';
        const method = id ? 'put' : 'post';

        const requestData = {
          ...formData,
          user_id: user?.id, 
          sellers: formDataArray,
        };
        console.log(requestData)
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
            setAlertMessage("New Order Added");
            router.push("/orders/domestic");
          }, 2000);
        } else {
          setAlertMessage("Failed to add order...");
          setIsSuccess(false);
          setIsLoading(false);
          console.error('Failed to add order', response);
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

   
  

    const handleOrderDateChange = (date: Date | undefined, field: keyof OrderItem) => {
          setFormData((prev) => ({
            ...prev,
            [field]: date ? format(date, "yyyy-MM-dd") : undefined,
          }));
        };
    
    const handleSellerDateChange = (
      date: Date | undefined,
      field: keyof SellerShippingDetailsItem,
      index: number
    ) => {
      setFormDataArray((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: date ? format(date, "yyyy-MM-dd") : "",
        };
        return updated;
      });
    };
        

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        
      };

    const handleFormDataChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      index: number
    ) => {
      const { name, value } = e.target;
    
      setFormDataArray((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [name]: value,
        };
        return updated;
      });
    };

    const handleSelectLogisticsChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };
      
    const handleSelectChange = (selected: string) => {
      const seller = sellers.find(s => s.id === parseInt(selected));
      if (!seller) return;

      // STEP 1: Add unique seller to formDataArray (for seller fields + product table)
      setFormDataArray(prev => {
        const alreadyExists = prev.some(item => item.seller_id === seller.id);
          if (alreadyExists) return prev;

          const newSellerBlock = {
            seller_id: seller.id,
            seller_name: seller.name,
            seller_address: seller.pickup_address,
            seller_contact: seller.mobile_number,
            shipping_name: '',
            address_line_1: '',
            address_line_2: '',
            seller_pincode: '',
            seller_contact_person_name: '',
            seller_contact_person_number: '',
            no_of_boxes: 0,
            weight_per_unit: 0,
            length: 0,
            width: 0,
            height: 0,
            dimension_unit: 'cm',
            invoice_generate_date: '',
            invoice_value: 0,
            invoice_number: '',
            order_ready_date: '',
            order_delivery_date: '',
            delivery_address:'',
            order_dispatch_date: '',
            invoicing_invoice_generate_date: '',
            invoicing_invoice_number: '',
            invoice_to: '',
            invoice_address: '',
            invoice_gstin: '',
            packaging_expenses: 0,
            invoicing_total_amount: 0,
            total_amount_in_words: '',
            invoicing_amount: 0,
            expenses: 0,
            products: [
              {
                product_name: "",
                hsn: "",
                rate_per_kg: "",
                total_kg: "",
                product_total_amount: 0,
              },
            ],
          };

          return [...prev, newSellerBlock];
        });

        // STEP 2: Add new seller rate row (every time seller is selected)
        const newSellerRow = {
          seller_name: seller.name,
          quantity: '',
          seller_offer_rate: 0,
          gst: '',
          buyer_offer_rate: 0,
          final_shipping_value: '',
          total_amount: 0,
        };

        setFormData(prev => ({
          ...prev,
          seller_assigned: selected,
          sellerdetails: [...(prev.sellerdetails || []), newSellerRow],
        }));
      };


    useEffect(() => {
      setFilteredSellers(
        sellers.filter((seller) =>
          seller.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [searchQuery, sellers]);

    

    const handleGeneratePDF = async () => {
      
      const token = localStorage.getItem("authToken");
      setIsPdfLoading(true); 
      try {
        const response = await axiosInstance.post(
          "/orders/generate-invoice-pdf",
          {
            invoicing_invoice_generate_date: formDataArray[0].invoicing_invoice_generate_date,
            invoicing_invoice_number: formDataArray[0].invoicing_invoice_number,
            invoice_to: formDataArray[0].invoice_to,
            invoice_address: formDataArray[0].invoice_address,
            invoice_gstin: formDataArray[0].invoice_gstin,
            packaging_expenses: formDataArray[0].packaging_expenses,
            invoicing_total_amount: formDataArray[0].invoicing_total_amount,
            total_amount_in_words: formDataArray[0].total_amount_in_words,
            products: formDataArray[0].products,
            invoicing_amount: formDataArray[0].invoicing_amount,
            expenses: formDataArray[0].expenses,
    
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );
    
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "invoice.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
      finally {
        setIsPdfLoading(false);
      }
    
    };

    const handleAddProduct = (index: number) => {
      const updatedFormDataArray = [...formDataArray];
      const seller = updatedFormDataArray[index];
      
      const newProduct = {
        product_name: "",
        hsn: "",
        rate_per_kg: "",
        total_kg: "",
        product_total_amount: 0,
      };

      seller.products.push(newProduct);
      setFormDataArray(updatedFormDataArray);
    };


    
    const handleProductChange = (
        index: number,
        productIndex: number,
        field: keyof ProductData,
        value: string | number
      ) => {
        const updatedFormData = [...formDataArray];
        const products = updatedFormData[index].products || [];

        products[productIndex] = {
          ...products[productIndex],
          [field]: value,
        };

        updatedFormData[index].products = products;
        setFormDataArray(updatedFormData);
      };


      
    const handleDeleteProduct = (index: number, productIndex: number) => {
      setFormDataArray((prev) => {
        const updated = [...prev];
        const products = updated[index].products || [];

        updated[index].products = products.filter((_, i) => i !== productIndex);

        return updated;
      });
    };


    const handleSellerDetailsChange = (
      sellerIndex: number,
      field: keyof SellerDetailsData,
      value: string
    ) => {
      setFormData((prev) => {
        const updated = [...prev.sellerdetails];
        updated[sellerIndex] = {
          ...updated[sellerIndex],
          [field]: value,
        };
        return {
          ...prev,
          sellerdetails: updated,
        };
      });
    };


    const handleDeleteSellerDetails = (sellerIndex: number) => {
      setFormData((prev) => ({
        ...prev,
        sellerdetails: prev.sellerdetails.filter((_, i) => i !== sellerIndex),
      }));
    };


    

    

    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>
           
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="orderNumber" className="text-[15px] font-inter-medium">Order Number</Label> 
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> : 
              <Input
                id="orderNumber"
                name="order_number"
                value={formData.order_number}
                placeholder="Please enter order number"
                onChange={handleChange}
                className="bg-white border"
                readOnly
              />
            }
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="name" className="text-[15px] font-inter-medium">Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Please enter name" className={`bg-white ${formErrors.name ? "border-red-500" : "border"}`} />
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="contactNumber" className="text-[15px] font-inter-medium">Contact Number</Label>
              <Input id="contactNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter contact number" className={`bg-white ${formErrors.mobile_number  ? "border-red-500" : "border"}`}/>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
              <h2 className="text-[18px] font-inter-semibold">Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
              <Label htmlFor="sellerAssigned"  className="text-[15px] font-inter-medium">Seller Assigned</Label> 
              <Select 
                name="seller_assigned" 
                value={formData.seller_assigned ?? ''} 
                onValueChange={(value: string) => handleSelectChange(value)}
                >
                <SelectTrigger className={`w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer ${
                    formErrors.seller_assigned ? "border-red-500" : ""
                  }`}>
                    <SelectValue placeholder={
                      sellers.find(s => String(s.id) === String(formData.seller_assigned))?.name || "Select Seller"
                    } />
                </SelectTrigger>
                <SelectContent>
                  
                <div className="px-2 py-1">
                  <Input
                    placeholder="Search seller..."
                    className="w-full text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                  <SelectItem value="placeholder" className="text-[13px] cursor-pointer">Select Seller</SelectItem>
                  {filteredSellers.map((seller) => (
                    <SelectItem key={seller.id} value={String(seller.id)} className="text-[13px] cursor-pointer">
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>
          {formData.seller_assigned && 
          <>
            <div className="flex justify-between mb-6 mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Seller Offer Rate</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Buyer Offer Rate</TableHead>
                    <TableHead>Final Shipping Value</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.sellerdetails?.map((sellerdetail, sellerIndex) => (
                    <TableRow key={sellerIndex}>
                      <TableCell>
                        <Input
                          value={sellerdetail.seller_name}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "seller_name", e.target.value)}
                          placeholder="Seller Name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={sellerdetail.quantity}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "quantity", e.target.value)}
                          placeholder="Quantity"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={sellerdetail.seller_offer_rate}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "seller_offer_rate", e.target.value)}
                          placeholder="Seller Offer Rate"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={sellerdetail.gst}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "gst", e.target.value)}
                          placeholder="GST"
                        />
                      </TableCell> 
                      <TableCell>
                        <Input
                          value={sellerdetail.buyer_offer_rate}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "buyer_offer_rate", e.target.value)}
                          placeholder="Buyer Offer Rate"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={sellerdetail.final_shipping_value}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "final_shipping_value", e.target.value)}
                          placeholder="Final Shipping Value"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={sellerdetail.total_amount}
                          onChange={(e) => handleSellerDetailsChange(sellerIndex, "total_amount", e.target.value)}
                          placeholder="Total Amount"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSellerDetails(sellerIndex)}
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
          </>
          }
          <input type="hidden" name="user_id" value={user?.id || ''} />  
        </div>

        <div className="flex justify-between">
              <h2 className="text-[18px] font-inter-semibold">Buyer Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="buyerGstNumber" className="text-[15px] font-inter-medium">Buyer GST Number</Label>
              <Input
                id="buyerGstNumber"
                name="buyer_gst_number"
                value={formData.buyer_gst_number || ''}
                placeholder="Please enter buyer GST number"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="buyerPAN" className="text-[15px] font-inter-medium">Buyer PAN</Label>
              <Input
                id="buyerPAN"
                name="buyer_pan"
                value={formData.buyer_pan || ''}
                placeholder="Please enter buyer PAN"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="buyerBankDetails" className="text-[15px] font-inter-medium">Buyer Bank Details</Label>
              <Input
                id="buyerBankDetails"
                name="buyer_bank_details"
                value={formData.buyer_bank_details || ''}
                placeholder="Please enter bank details"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="amountReceived" className="text-[15px] font-inter-medium">Amount Received</Label>
              <Input
                id="amountReceived"
                type="number"
                name="amount_received"
                value={formData.amount_received || ''}
                placeholder="Please enter amount received"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="amountReceivedDate" className="text-[15px] font-inter-medium">Amount Received Date</Label>
              <DatePicker 
                date={formData.amount_received_date ? new Date(formData.amount_received_date) : undefined} 
                setDate={(date) => handleOrderDateChange(date, "amount_received_date")} 
                placeholder="DD-MM-YYYY" 
              />
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="amountPaid" className="text-[15px] font-inter-medium">Amount Paid</Label>
              <Input
                id="amountPaid"
                type="number"
                name="amount_paid"
                value={formData.amount_paid || ''}
                placeholder="Please enter amount paid"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="amountPaidDate" className="text-[15px] font-inter-medium">Amount Paid Date</Label>
              <DatePicker 
                date={formData.amount_paid_date ? new Date(formData.amount_paid_date) : undefined} 
                setDate={(date) => handleOrderDateChange(date, "amount_paid_date")} 
                placeholder="DD-MM-YYYY" 
              />
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="logisticsThrough" className="text-[15px] font-inter-medium">Logistics Through</Label>
              <Select name="logistics_through" value={formData.logistics_through ?? ''}
                onValueChange={(value: string) => handleSelectLogisticsChange('logistics_through',value)}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                  <SelectValue placeholder="Select Logistics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller_fulfilled" className="cursor-pointer">Seller Fulfilled</SelectItem>
                  <SelectItem value="ship_rocket" className="cursor-pointer">Shiprocket</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="logisticsAgency" className="text-[15px] font-inter-medium">Logistics Agency</Label>
              <Input
                id="logisticsAgency"
                name="logistics_agency"
                value={formData.logistics_agency || ''}
                placeholder="Plese enter logistics agency"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="shippingEstimateValue" className="text-[15px] font-inter-medium">Shipping Estimate Value</Label>
              <Input
                id="shippingEstimateValue"
                name="shipping_estimate_value"
                value={formData.shipping_estimate_value || ''}
                placeholder="Please enter estimate value"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>

          <div className="space-y-2 w-[80%]">
            <Label htmlFor="buyerFinalShippingValue" className="text-[15px] font-inter-medium">Final Shipping Value</Label>
              <Input
                id="buyerFinalShippingValue"
                name="buyer_final_shipping_value"
                value={formData.buyer_final_shipping_value || ''}
                placeholder="Please enter final value"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="buyerTotalAmount" className="text-[15px] font-inter-medium">Total Amount</Label>
              <Input
                id="buyerTotalAmount"
                name="buyer_total_amount"
                value={formData.buyer_total_amount || ''}
                placeholder="Please enter total amount"
                onChange={handleChange}
                className="bg-white border"
              />
          </div>
        </div>

    {/*********************************** shipping details **************************************/}
      
      {formDataArray.map((formData, index) => (
        <div key={index}>
          <div key={formData.seller_id ?? index}>
            <div className="flex justify-between">
                  <h2 className="text-[18px] font-inter-semibold">Seller #{index + 1}</h2>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Seller Name</Label>
                  <Input
                    value={formData.seller_name || ''}
                    readOnly
                    className="bg-gray-100 border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">

                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Seller Address</Label>
                  <Input
                    value={formData.seller_address || ''}
                    readOnly
                    className="bg-gray-100 border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Seller Contact</Label>
                  <Input
                    value={formData.seller_contact || ''}
                    readOnly
                    className="bg-gray-100 border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="shippingName" className="text-[15px] font-inter-medium">Shipping Name</Label>
                  <Input
                    id="shippingName"
                    name="shipping_name"
                    value={formDataArray[index].shipping_name || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter name"
                    className="bg-white border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="addressLine1" className="text-[15px] font-inter-medium">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    name="address_line_1"
                    value={formDataArray[index].address_line_1 || ''}
                    maxLength={50}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Max. 50 characters"
                    className="bg-white border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="address2" className="text-[15px] font-inter-medium">Address Line 2</Label>
                  <Input
                    id="address2"
                    name="address_line_2"
                    value={formDataArray[index].address_line_2 || ''}
                    maxLength={50}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Max. 50 characters"
                    className="bg-white border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sellerPincode" className="text-[15px] font-inter-medium">Pincode</Label>
                  <Input
                    id="sellerPincode"
                    name="seller_pincode"
                    value={formDataArray[index].seller_pincode || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Enter Seller Pincode"
                    className="bg-white border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sellerContactPersonName" className="text-[15px] font-inter-medium">Contact Person Name</Label>
                  <Input
                    id="sellerContactPersonName"
                    name="seller_contact_person_name"
                    value={formDataArray[index].seller_contact_person_name || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter contact person"
                    className="bg-white border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="sellerContactNumber" className="text-[15px] font-inter-medium">Contact Person Number</Label>
                  <Input
                    id="sellerContactPersonNumber"
                    name="seller_contact_person_number"
                    value={formDataArray[index].seller_contact_person_number || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter phone number"
                    className="bg-white border"
                  />
                </div>

              </div>

              

          
            <div className="flex justify-between">
                  <h2 className="text-[18px] font-inter-semibold">Invoice Details</h2>
            </div>
          
              
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
              <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Invoice Generate Date</Label>
                    <DatePicker 
                    date={formDataArray[index].invoicing_invoice_generate_date ? new Date(formDataArray[index].invoicing_invoice_generate_date) : undefined} 
                    setDate={(date) => handleSellerDateChange(date, "invoicing_invoice_generate_date",index)} 
                    placeholder="DD-MM-YYYY" 
                    
                  />
              </div>
              <div className="space-y-2 w-[80%]">
                <Label className="text-[15px] font-inter-medium">Invoice Number</Label>
                  <Input
                  id="invoiceingInvoiceNumber"
                  name="invoicing_invoice_number"
                  value={formDataArray[index].invoicing_invoice_number || ''}
                  onChange={(e) => handleFormDataChange(e, index)}
                  placeholder="Please enter invoice number"
                  className="bg-white border"
                  />
              </div>
              <div className="space-y-2 w-[80%]">
                <Label className="text-[15px] font-inter-medium">Invoice To</Label>
                  <Input
                  id="invoiceTo"
                  name="invoice_to"
                  value={formDataArray[index].invoice_to || ''}
                  onChange={(e) => handleFormDataChange(e, index)}
                  placeholder="Please enter invoice to"
                  className="bg-white border"
                  />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
              <div className="space-y-2 w-[80%]">
                <Label className="text-[15px] font-inter-medium">Invoice Address</Label>
                  <Input
                  id="invoiceAddress"
                  name="invoice_address"
                  value={formDataArray[index].invoice_address || ''}
                  onChange={(e) => handleFormDataChange(e, index)}
                  placeholder="Please enter invoice address"
                  className="bg-white border"
                  />
              </div>
              <div className="space-y-2 w-[80%]">
                <Label className="text-[15px] font-inter-medium">Invoice GSTIN</Label>
                
                  <Input
                  id="invoiceGSTIN"
                  name="invoice_gstin"
                  value={formDataArray[index].invoice_gstin || ''}
                  onChange={(e) => handleFormDataChange(e, index)}
                  placeholder="Please enter invoice GSTIN"
                  className="bg-white border"
                  />
              </div>
              
              
            </div>

            <div className="flex justify-between mb-6 mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead>Rate per KG</TableHead>
                    <TableHead>Total KG</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.products?.map((product, productIndex) => (
                    <TableRow key={`${index}-${productIndex}`}>
                      <TableCell>
                        <Input
                          value={product.product_name}
                          onChange={(e) => handleProductChange(index, productIndex, "product_name", e.target.value)}
                          placeholder="Product Name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.hsn}
                          onChange={(e) => handleProductChange(index, productIndex, "hsn", e.target.value)}
                          placeholder="HSN Code"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.rate_per_kg}
                          onChange={(e) => handleProductChange(index, productIndex, "rate_per_kg", e.target.value)}
                          placeholder="Rate per KG"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.total_kg}
                          onChange={(e) => handleProductChange(index, productIndex, "total_kg", e.target.value)}
                          placeholder="Total KG"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.product_total_amount}
                          onChange={(e) => handleProductChange(index, productIndex, "product_total_amount", e.target.value)}
                          placeholder="Total Amount"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(index, productIndex)}
                          className="text-[12px] px-2 py-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

                <Button
                  type="button"
                  onClick={() => handleAddProduct(index)}
                  className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 capitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold"
                >
                  + Add New Product
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
              <div className="space-y-2 w-[80%]">
              <Label htmlFor="invoiceAmount" className="text-[15px] font-inter-medium">Amount</Label>
                <Input
                  id="invoiceAmount"
                  name="invoicing_amount"
                  type="number"
                  value={formDataArray[index].invoicing_amount || ''}
                  placeholder="Please enter amount"
                  onChange={(e) => handleFormDataChange(e, index)}
                  className="bg-white border"
                />
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="packagingExpenses" className="text-[15px] font-inter-medium">Packaging Expenses</Label>
                  <Input
                    id="packaging_expenses"
                    name="packaging_expenses"
                    type="number"
                    value={formDataArray[index].packaging_expenses || ''}
                    placeholder="Please enter packaging expenses"
                    onChange={(e) => handleFormDataChange(e, index)}
                    className="bg-white border"
                  />
              </div>
            <div className="space-y-2 w-[80%]">
              <Label htmlFor="expenses" className="text-[15px] font-inter-medium">Other Expenses</Label>
                <Input
                  id="expenses"
                  name="expenses"
                  type="number"
                  value={formDataArray[index].expenses || ''}
                  placeholder="Please enter additional expenses"
                  onChange={(e) => handleFormDataChange(e, index)}
                  className="bg-white border"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
              <Label htmlFor="invoicingTotalAmount" className="text-[15px] font-inter-medium">Total Amount</Label>
                <Input
                  id="invoicingTotalAmount"
                  name="invoicing_total_amount"
                  type="number"
                  value={formDataArray[index].invoicing_total_amount || ''}
                  placeholder="Please enter total amount"
                  onChange={(e) => handleFormDataChange(e, index)}
                  className="bg-white border"
                />
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="totalAmountInWords" className="text-[15px] font-inter-medium">Total Amount (in words)</Label>
                  <Input
                    id="totalAmountInWords"
                    name="total_amount_in_words"
                    value={formDataArray[index].total_amount_in_words || ''}
                    placeholder="e.g., One Thousand Only"
                    onChange={(e) => handleFormDataChange(e, index)}
                    className="bg-white border"
                  />
              </div>

            <div className="space-y-2 w-[80%] flex items-end justify-end">
              <RainbowButton
                type="button"
                disabled={isPdfLoading}
                className={`w-full ${isPdfLoading ? "opacity-50 cursor-not-allowed" : ""} bg-black text-white dark:bg-white dark:text-black hover:bg-black text-[14px] cursor-pointer font-inter-semibold`}
                onClick={handleGeneratePDF}
              >
                {isPdfLoading ? (
                  <>
                  <Loader className="h-5 w-5 animate-spin" /> 
                  </>
                ) : (
                  "Generate PDF"
                )}
              </RainbowButton>
            </div>

            </div>

            
            <div className="flex justify-between">
                    <h2 className="text-[18px] font-inter-semibold">Package Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="noOfBoxes" className="text-[15px] font-inter-medium">No. of Boxes</Label>
                  <Input
                    id="noOfBoxes"
                    name="no_of_boxes"
                    value={formDataArray[index].no_of_boxes || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter box count"
                    className="bg-white border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="weightPerUnit" className="text-[15px] font-inter-medium">Weight (per unit in Kg)</Label>
                  <Input
                    id="weightPerUnit"
                    name="weight_per_unit"
                    value={formDataArray[index].weight_per_unit || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="weight"
                    className="bg-white border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Dimensions (L × W × H)</Label>
                  <div className="flex gap-2">
                    <Input
                      name="length"
                      value={formDataArray[index].length || ''}
                      onChange={(e) => handleFormDataChange(e, index)}
                      placeholder="length"
                      className="bg-white border"
                    />
                    <Input
                      name="width"
                      value={formDataArray[index].width || ''}
                      onChange={(e) => handleFormDataChange(e, index)}
                      placeholder="width"
                      className="bg-white border"
                    />
                    <Input
                      name="height"
                      value={formDataArray[index].height || ''}
                      onChange={(e) => handleFormDataChange(e, index)}
                      placeholder="height"
                      className="bg-white border"
                    />
                  </div>
                <div className="mt-1">
                  <select
                    name="dimension_unit"
                    value={formDataArray[index].dimension_unit || 'cm'}
                    onChange={(e) => handleFormDataChange(e, index)}
                    className="bg-white border px-2 py-1 text-sm rounded"
                  >
                    <option value="cm">Cm</option>
                    <option value="inch">Inch</option>
                  </select>
                </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Invoice Generate Date</Label>
                    <DatePicker 
                    date={formDataArray[index].invoice_generate_date ? new Date(formDataArray[index].invoice_generate_date) : undefined} 
                    setDate={(date) => handleSellerDateChange(date, "invoice_generate_date",index)} 
                    placeholder="DD-MM-YYYY" 
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="invoiceValue" className="text-[15px] font-inter-medium">Invoice Value</Label>
                  <Input
                    id="invoiceValue"
                    name="invoice_value"
                    value={formDataArray[index].invoice_value || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter invoice value"
                    className="bg-white border"
                  />
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="invoiceNumber" className="text-[15px] font-inter-medium">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    name="invoice_number"
                    value={formDataArray[index].invoice_number || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter invoice number"
                    className="bg-white border"
                  />
                </div>
              </div>
            

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Delivery Address</Label>
                  <Input
                    name="delivery_address"
                    value={formDataArray[index].delivery_address || ''}
                    onChange={(e) => handleFormDataChange(e, index)}
                    placeholder="Please enter delivery address"
                    className="bg-white border"
                  />
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Order Ready Date</Label>
                  <DatePicker 
                    date={formDataArray[index].order_ready_date ? new Date(formDataArray[index].order_ready_date) : undefined} 
                    setDate={(date) => handleSellerDateChange(date, "order_ready_date",index)} 
                    placeholder="DD-MM-YYYY" 
                  />
                </div>
                
                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Order Dispatch Date</Label>
                  <DatePicker 
                    date={formDataArray[index].order_dispatch_date ? new Date(formDataArray[index].order_dispatch_date) : undefined} 
                    setDate={(date) => handleSellerDateChange(date, "order_dispatch_date",index)} 
                    placeholder="DD-MM-YYYY" 
                  />
                </div>
                {formDataArray[index].order_dispatch_date && (
                <div className="space-y-2 w-[80%]">
                  <Label className="text-[15px] font-inter-medium">Order Delivery Date</Label>
                  <DatePicker 
                    date={formDataArray[index].order_delivery_date ? new Date(formDataArray[index].order_delivery_date) : undefined} 
                    setDate={(date) => handleSellerDateChange(date, "order_delivery_date",index)} 
                    placeholder="DD-MM-YYYY" 
                  />
                </div>
                )}
              </div>



          </div>
        </div>
      ))}

  
        <RainbowButton 
         type="submit"
         className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer `}
         disabled={isLoading}
         >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
        ) : (
            "Add Order"
          )}
        </RainbowButton>

        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
      </form>
    
    
  )
}

export default OrderForm;