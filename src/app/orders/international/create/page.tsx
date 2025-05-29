"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { DatePicker } from "@/components/date-picker";
import { Loader, Plus, Trash2 } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";
import { OrderItem } from "@/types/order";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SellerShippingDetailsItem } from "@/types/sellershippingdetails";
import { SkeletonCard } from "@/components/SkeletonCard";
import React from "react";
import { toWords } from 'number-to-words';

interface User {
  id: string;
}

type Seller = {
  id:string;
  name : string;
  pickup_address : string;
  mobile_number : string;
}

interface Product {
  id: string;
  seller_assigned: string | null;
  product_name: string;
  quantity: number;
  seller_offer_rate: number;
  gst: number;
  buyer_offer_rate: number;
  buyer_order_amount: number;
  final_shipping_value: number;
  total_amount:number;
  rate_per_kg: number;
  total_kg: number;
  hsn: string;
  product_total_amount : number;
}




export default function InternationalOrderForm() {

  const [sellers, setSellers] = useState<Seller[]>([]);
  const router = useRouter();
  const { id } = useParams<{ id: string }>() ?? {};
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isInputLoading, setIsInputLoading] = useState(true);
  const [isMobileDuplicate, setIsMobileDuplicate] = useState("");

const [formData, setFormData] = useState<OrderItem>({
      id: 0,
      seller_id:0,
      order_number: 0,
      name: '',
      mobile_number: '',
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
      products: []
    });

    const [formDataArray, setFormDataArray] = useState<SellerShippingDetailsItem[]>([
    
          {
                  seller_id: 0,
                  seller_name: '',
                  seller_address: '',
                  seller_contact: '',
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
                  packaging_expenses: '',
                  invoicing_total_amount: '',
                  total_amount_in_words: '',
                  invoicing_amount: '',
                  expenses: '',
                  

          }
    
        ]);

        


  const [formErrors, setFormErrors] = useState({
    name:false,
    mobile_number:false,
  });
  const [products, setProducts] = useState<Product[]>([
    {
      id: "",
      product_name: "",
      seller_assigned: null,
      quantity: 0,
      seller_offer_rate: 0,
      gst: 0,
      buyer_offer_rate: 0,
      buyer_order_amount:0,
      final_shipping_value: 0,
      total_amount: 0,
      rate_per_kg: 0,
      total_kg: 0,
      hsn: '',
      product_total_amount : 0
    },
  ])

  

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
              '/international-orders/next-number',
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
      }  finally {
        setIsLoading(false);
      }
    }
        
    fetchSellers();
  }, []);


  // Get unique assigned sellers
  const uniqueAssignedSellers = useMemo(() => {
    const assignedSellerIds = products.filter((p) => p.seller_assigned).map((p) => p.seller_assigned)
    return [...new Set(assignedSellerIds)].filter(Boolean) as string[]
  }, [products])

  // Calculate total amount for each product
  useEffect(() => {
    const updatedProducts = products.map((product) => {
      const gstAmount = (product.buyer_offer_rate * product.gst) / 100;
      const total_amount =
        (product.buyer_offer_rate + gstAmount + product.final_shipping_value) * product.quantity;
      return { ...product, total_amount };
    });
  
    // Only update if total_amount actually changed
    const hasChanged = updatedProducts.some(
      (p, i) => p.total_amount !== products[i].total_amount
    );
  
    if (hasChanged) {
      setProducts(updatedProducts);
    }
  }, [products]);


  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      product_name: "",
      seller_assigned: null,
      quantity: 0,
      seller_offer_rate: 0,
      gst: 0,
      buyer_offer_rate: 0,
      buyer_order_amount:0,
      final_shipping_value: 0,
      total_amount: 0,
      hsn: "",
      rate_per_kg: 0,
      total_kg: 0,
      product_total_amount: 0,
    }
    setProducts([...products, newProduct])
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  

  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );

    };


const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
  
};

  const handleOrderDateChange = (date: Date | undefined, field: keyof OrderItem) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? format(date, "yyyy-MM-dd") : undefined,
    }));
  };

  const handleSelectLogisticsChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };

    function formatAmountInWords(amount: number): string {
          const words = toWords(amount).replace(/,/g, '');
          const capitalized = words
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    
          return capitalized + ' Rupees';
        }


        useEffect(() => {
          const updated = formDataArray.map((form, index) => {
            const sellerId = uniqueAssignedSellers[index];
            const productsForSeller = products.filter(
              (product) => product.seller_assigned === sellerId
            );

            const totalAmount = productsForSeller.reduce(
              (sum, product) => sum + (Number(product.product_total_amount) || 0),
              0
            );

            const amountInWords = formatAmountInWords(totalAmount);

            return {
              ...form,
              invoicing_amount: totalAmount.toFixed(2),
              total_amount_in_words: amountInWords,
            };
          });

          // Avoid infinite loop if data hasn't changed
          const isSame =
            JSON.stringify(formDataArray) === JSON.stringify(updated);
          if (!isSame) {
            setFormDataArray(updated);
          }
        }, [formDataArray, products, uniqueAssignedSellers]);





          const handleFormDataChange = (
          e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
          index: number
        ) => {
          const { name, value } = e.target;
        
          setFormDataArray((prev) => {
            const updated = [...prev];
            const current = { ...updated[index], [name]: value };
            const invoicingAmount = parseFloat(current.invoicing_amount) || 0;
            const packagingExpenses = parseFloat(current.packaging_expenses) || 0;
            const otherExpenses = parseFloat(current.expenses) || 0;
            const totalAmount = invoicingAmount + packagingExpenses + otherExpenses;
    
            const amountInWords = formatAmountInWords(totalAmount);
    
            updated[index] = {
              ...current,
              invoicing_total_amount: totalAmount.toFixed(0),
              total_amount_in_words: amountInWords
            };
            return updated;
          });
    
    
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


            const handleGeneratePDF = async () => {
      
      const token = localStorage.getItem("authToken");
      setIsPdfLoading(true); 
      try {
        const response = await axiosInstance.post(
          "/international-orders/generate-invoice-pdf",
          {
            invoicing_invoice_generate_date: formDataArray[0].invoicing_invoice_generate_date,
            invoicing_invoice_number: formDataArray[0].invoicing_invoice_number,
            invoice_to: formDataArray[0].invoice_to,
            invoice_address: formDataArray[0].invoice_address,
            invoice_gstin: formDataArray[0].invoice_gstin,
            packaging_expenses: formDataArray[0].packaging_expenses,
            invoicing_total_amount: formDataArray[0].invoicing_total_amount,
            total_amount_in_words: formDataArray[0].total_amount_in_words,
            invoicing_amount: formDataArray[0].invoicing_amount,
            expenses: formDataArray[0].expenses,
            products:products

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const newFormErrors = {
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
        const url = id ? `international-orders/${id}` : 'international-orders';
        const method = id ? 'put' : 'post';

        const requestData = {
          ...formData,
          user_id: user?.id, 
          international_sellers: formDataArray,
          products: products,
        };
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
            router.push("/orders/international");
          }, 2000);
        } else {
          setAlertMessage("Failed to add order...");
          setIsSuccess(false);
          setIsLoading(false);
          console.error('Failed to add order', response);
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
              <Input id="contactNumber" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Please enter contact number" className={`bg-white ${formErrors.mobile_number || isMobileDuplicate ? "border-red-500" : "border"}`}/>
              {isMobileDuplicate && (
                <p className="text-red-600 text-[13px] font-medium mt-1">{isMobileDuplicate}</p>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[100%]">

            {/* Products Table */}
            <Card className="">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Product Name</TableHead>
                        <TableHead className="w-[200px]">Seller</TableHead>
                        <TableHead className="w-[100px]">Quantity</TableHead>
                        <TableHead className="w-[150px]">Seller Offer Rate per Kg</TableHead>
                        <TableHead className="w-[100px]">GST (%)</TableHead>
                        <TableHead className="w-[150px]">Buyer Offer Rate per Kg</TableHead>
                        <TableHead className="w-[150px]">Buyer Order Amount</TableHead>
                        <TableHead className="w-[150px]">Final Shipping Value</TableHead>
                        <TableHead className="w-[150px]">Total Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Input
                              value={product.product_name}
                              onChange={(e) => updateProduct(product.id, "product_name", e.target.value)}
                              placeholder="Enter product name"
                            />
                          </TableCell>
                          <TableCell>
                            <SellerDropdown
                              sellers={sellers}
                              value={product.seller_assigned}
                              onSelect={(value) => updateProduct(product.id, "seller_assigned", value)}
                            />
                            
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.quantity}
                              onChange={(e) => updateProduct(product.id, "quantity", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.seller_offer_rate}
                              onChange={(e) =>
                                updateProduct(product.id, "seller_offer_rate", e.target.value)
                              }
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.gst}
                              onChange={(e) => updateProduct(product.id, "gst", e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.buyer_offer_rate}
                              onChange={(e) =>
                                updateProduct(product.id, "buyer_offer_rate", e.target.value)
                              }
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.buyer_order_amount}
                              onChange={(e) =>
                                updateProduct(product.id, "buyer_order_amount", e.target.value)
                              }
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Input
                              value={product.final_shipping_value}
                              onChange={(e) =>
                                updateProduct(product.id, "final_shipping_value", e.target.value)
                              }
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell className="font-inter-semibold">₹{product.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={()=> addProduct()} type="button">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <input type="hidden" name="user_id" value={user?.id || ''} /> 
          </div>
        </div> 
   

        <Accordion type="multiple" defaultValue={["buyer"]}>
          <AccordionItem value="buyer">
            <AccordionTrigger className="font-inter-semibold text-[16px]">Buyer Details</AccordionTrigger>
              <AccordionContent>
                <Card>
                    <CardContent>
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
                          id="amountReceivedDate"
                          date={formData.amount_received_date ? new Date(formData.amount_received_date) : undefined} 
                          setDate={(date) => handleOrderDateChange(date, "amount_received_date")} 
                          placeholder="DD-MM-YYYY" 
                        />
                    </div>

                    <div className="space-y-2 w-[80%]">
                      <Label htmlFor="amountPaid" className="text-[15px] font-inter-medium">Amount Paid</Label>
                        <Input
                          id="amountPaid"
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
                          id="amountPadiDate"
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
                            <SelectItem value="seller_fulfilled" className="text-[13px] cursor-pointer">Seller Fulfilled</SelectItem>
                            <SelectItem value="ship_rocket" className="text-[13px] cursor-pointer">Shiprocket</SelectItem>
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
                  </CardContent>
                  </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
          

        {/* Seller Sections */}
        {uniqueAssignedSellers.length > 0 && (
          
          <div className="space-y-6">
            <h2 className="text-[16px] font-inter-semibold">Seller Information</h2>
            <Accordion type="multiple" className="space-y-4">
              {uniqueAssignedSellers.map((sellerId,index) => {
                const seller = sellers.find((s) => s.id === sellerId)
                if (!seller) return null

                const productsForSeller = products.filter(
                  (product) => product.seller_assigned === sellerId
                );
                
                return (
                  <Card key={sellerId}>
                    <CardHeader>
                      <CardTitle className="mt-5 text-[16px]">{seller.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple" defaultValue={["seller", "invoice", "packaging"]}>
                        <AccordionItem value="seller">
                          <AccordionTrigger>Seller Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
                                <div className="space-y-2 w-[80%]">
                                  <Label className="text-[15px] font-inter-medium">Seller Name</Label>
                                  <Input
                                    value={seller.name || ''}
                                    readOnly
                                    className="bg-gray-100 border"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
        
                                <div className="space-y-2 w-[80%]">
                                  <Label className="text-[15px] font-inter-medium">Seller Address</Label>
                                  <Input
                                    value={seller.pickup_address || ''}
                                    readOnly
                                    className="bg-gray-100 border"
                                  />
                                </div>
        
                                <div className="space-y-2 w-[80%]">
                                  <Label className="text-[15px] font-inter-medium">Seller Contact</Label>
                                  <Input
                                    value={seller.mobile_number || ''}
                                    readOnly
                                    className="bg-gray-100 border"
                                  />
                                </div>
                                <div className="space-y-2 w-[80%]">
                                  <Label htmlFor={`shippingName-${index}`} className="text-[15px] font-inter-medium">Shipping Name</Label>
                                  <Input
                                    id={`shippingName-${index}`}
                                    name="shipping_name"
                                    value={formDataArray[index]?.shipping_name || ''}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="Please enter name"
                                    className="bg-white border"
                                  />

                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                                <div className="space-y-2 w-[80%]">
                                  <Label htmlFor={`address_line_1-${index}`} className="text-[15px] font-inter-medium">Address Line 1</Label>
                                  <Input
                                    id={`address_line_1-${index}`}
                                    name="address_line_1"
                                    value={formDataArray[index]?.address_line_1 || ''}
                                    maxLength={50}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="Max. 50 characters"
                                    className="bg-white border"
                                  />
                                </div>
        
                                <div className="space-y-2 w-[80%]">
                                  <Label htmlFor="address2" className="text-[15px] font-inter-medium">Address Line 2</Label>
                                  <Input
                                    id={`address2-${index}`}
                                    name="address_line_2"
                                    value={formDataArray[index]?.address_line_2 || ''}
                                    maxLength={50}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="Max. 50 characters"
                                    className="bg-white border"
                                  />
                                </div>
        
                                <div className="space-y-2 w-[80%]">
                                  <Label htmlFor="sellerPincode" className="text-[15px] font-inter-medium">Pincode</Label>
                                  <Input
                                    id={`sellerPincode-${index}`}
                                    name="seller_pincode"
                                    value={formDataArray[index]?.seller_pincode || ''}
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
                                    id={`sellerContactPersonName-${index}`}
                                    name="seller_contact_person_name"
                                    value={formDataArray[index]?.seller_contact_person_name || ''}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="Please enter contact person"
                                    className="bg-white border"
                                  />
                                </div>
        
                                <div className="space-y-2 w-[80%]">
                                  <Label htmlFor="sellerContactNumber" className="text-[15px] font-inter-medium">Contact Person Number</Label>
                                  <Input
                                    id={`sellerContactPersonNumber-${index}`}
                                    name="seller_contact_person_number"
                                    value={formDataArray[index]?.seller_contact_person_number || ''}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="Please enter phone number"
                                    className="bg-white border"
                                  />
                                </div>
        
                              </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="invoice">
                          <AccordionTrigger>Invoice Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                  <Label htmlFor={`invocingInvoiceGenerateDate-${index}`} className="text-[15px] font-inter-medium">Invoice Generate Date</Label>
                                    <DatePicker 
                                    id={`invocingInvoiceGenerateDate-${index}`}
                                    date={formDataArray[index]?.invoicing_invoice_generate_date ? new Date(formDataArray[index]?.invoicing_invoice_generate_date) : undefined} 
                                    setDate={(date) => handleSellerDateChange(date, "invoicing_invoice_generate_date",index)} 
                                    placeholder="DD-MM-YYYY" 
                                    
                                  />
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`invoicingInvoiceNumber-${index}`} className="text-[15px] font-inter-medium">Invoice Number</Label>
                                  <Input
                                  id={`invoiceingInvoiceNumber-${index}`}
                                  name="invoicing_invoice_number"
                                  value={formDataArray[index]?.invoicing_invoice_number || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter invoice number"
                                  className="bg-white border"
                                  />
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`invoiceTo-${index}`} className="text-[15px] font-inter-medium">Invoice To</Label>
                                  <Input
                                  id={`invoiceTo-${index}`}
                                  name="invoice_to"
                                  value={formDataArray[index]?.invoice_to || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter invoice to"
                                  className="bg-white border"
                                  />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`invoiceAddress-${index}`} className="text-[15px] font-inter-medium">Invoice Address</Label>
                                  <Input
                                  id={`invoiceAddress-${index}`}
                                  name="invoice_address"
                                  value={formDataArray[index]?.invoice_address || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter invoice address"
                                  className="bg-white border"
                                  />
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`invoiceGSTIN-${index}`} className="text-[15px] font-inter-medium">Invoice GSTIN</Label>
                                
                                  <Input
                                  id={`invoiceGSTIN-${index}`}
                                  name="invoice_gstin"
                                  value={formDataArray[index]?.invoice_gstin || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter invoice GSTIN"
                                  className="bg-white border"
                                  />
                              </div>
                            </div>
                            <Card>
                                  <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>HSN</TableHead>
                                            <TableHead>Rate per KG</TableHead>
                                            <TableHead>Total KG</TableHead>
                                            <TableHead>Amount</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        

                                        <TableBody>
                                          
                                          {productsForSeller.map((invoiceproduct) => (
                                            <TableRow key={invoiceproduct.id}>
                                              <TableCell>
                                                <Input
                                                  value={invoiceproduct.product_name}
                                                  onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    setProducts(
                                                      products.map((p) =>
                                                        p.id === invoiceproduct.id ? { ...p, product_name: newValue } : p
                                                      )
                                                    );
                                                  }}
                                                  placeholder="Product Name"
                                                />

                                              </TableCell>
                                              <TableCell>
                                                <Input
                                                  value={invoiceproduct.hsn}
                                                  onChange={(e) => {
                                                    const newValue = e.target.value
                                                    setProducts(
                                                      products.map((p) =>
                                                        p.id === invoiceproduct.id ? { ...p, hsn: newValue } : p,
                                                      ),
                                                    )
                                                  }}
                                                  placeholder="HSN Code"
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <Input
                                                  value={invoiceproduct.rate_per_kg}
                                                  onChange={(e) => {
                                                  const newValue = Number.parseFloat(e.target.value) || 0
                                                  const total_kg = invoiceproduct.total_kg || 0
                                                  const productTotalAmount = newValue * total_kg

                                                  setProducts(
                                                    products.map((p) =>
                                                      p.id === invoiceproduct.id
                                                        ? {
                                                            ...p,
                                                            rate_per_kg: newValue,
                                                            product_total_amount: productTotalAmount,
                                                          }
                                                        : p,
                                                    ),
                                                  )
                                                }}
                                                  
                                                  placeholder="Rate per KG"
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <Input
                                                  value={invoiceproduct.total_kg}
                                                  onChange={(e) => {
                                                    const newValue = Number.parseFloat(e.target.value) || 0
                                                    const ratePerKg = invoiceproduct.rate_per_kg || 0
                                                    const productTotalAmount = ratePerKg * newValue

                                                    setProducts(
                                                      products.map((p) =>
                                                        p.id === invoiceproduct.id
                                                          ? {
                                                              ...p,
                                                              total_kg: newValue,
                                                              product_total_amount: productTotalAmount,
                                                            }
                                                          : p,
                                                      ),
                                                    )
                                                  }}
                                                  placeholder="Total KG"
                                                />
                                              </TableCell>
                                              <TableCell className="font-inter-semibold">
                                                ₹{(invoiceproduct.product_total_amount || 0).toFixed(2)}
                                              </TableCell>
                                              <TableCell>
                                            </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                        
                                      </Table>
                                    </div>
                                  </CardContent>
                              </Card>
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                                <div className="space-y-2 w-[80%]">
                                <Label htmlFor="invoiceAmount" className="text-[15px] font-inter-medium">Amount</Label>
                                  <Input
                                    id={`invoiceAmount-${index}`}
                                    name="invoicing_amount"
                                    value={formDataArray[index]?.invoicing_amount || ''}
                                    placeholder="Please enter amount"
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    className="bg-white border"
                                  />
                              </div>
                              <div className="space-y-2 w-[80%]">
                                  <Label htmlFor="packagingExpenses" className="text-[15px] font-inter-medium">Packaging Expenses</Label>
                                    <Input
                                      id={`packaging_expenses-${index}`}
                                      name="packaging_expenses"
                                      value={formDataArray[index]?.packaging_expenses || ''}
                                      placeholder="Please enter packaging expenses"
                                      onChange={(e) => handleFormDataChange(e, index)}
                                      className="bg-white border"
                                    />
                                </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="expenses" className="text-[15px] font-inter-medium">Other Expenses</Label>
                                  <Input
                                    id={`expenses-${index}`}
                                    name="expenses"
                                    value={formDataArray[index]?.expenses || ''}
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
                                    id={`invoicingTotalAmount-${index}`}
                                    name="invoicing_total_amount"
                                    value={formDataArray[index]?.invoicing_total_amount || ''}
                                    placeholder="Please enter total amount"
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    className="bg-white border"
                                    readOnly
                                  />
                              </div>
                              <div className="space-y-2 w-[80%]">
                                  <Label htmlFor="totalAmountInWords" className="text-[15px] font-inter-medium">Total Amount (in words)</Label>
                                    <Input
                                      id={`totalAmountInWords-${index}`}
                                      name="total_amount_in_words"
                                      value={formDataArray[index]?.total_amount_in_words || ''}
                                      placeholder="e.g., One Thousand Only"
                                      onChange={(e) => handleFormDataChange(e, index)}
                                      className="bg-white border"
                                      readOnly
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
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="packaging">
                          <AccordionTrigger>Packaging Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="noOfBoxes" className="text-[15px] font-inter-medium">No. of Boxes</Label>
                                <Input
                                  id={`noOfBoxes-${index}`}
                                  name="no_of_boxes"
                                  value={formDataArray[index]?.no_of_boxes || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter box count"
                                  className="bg-white border"
                                />
                              </div>
      
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="weightPerUnit" className="text-[15px] font-inter-medium">Weight (per unit in Kg)</Label>
                                <Input
                                  id={`weightPerUnit-${index}`}
                                  name="weight_per_unit"
                                  value={formDataArray[index]?.weight_per_unit || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="weight"
                                  className="bg-white border"
                                />
                              </div>
      
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Dimensions (L × W × H)</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id={`length-${index}`}
                                    name="length"
                                    value={formDataArray[index]?.length || ''}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="length"
                                    className="bg-white border"
                                  />
                                  <Input
                                    id={`width-${index}`}
                                    name="width"
                                    value={formDataArray[index]?.width || ''}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="width"
                                    className="bg-white border"
                                  />
                                  <Input
                                    id={`height-${index}`}
                                    name="height"
                                    value={formDataArray[index]?.height || ''}
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    placeholder="height"
                                    className="bg-white border"
                                  />
                                </div>
                              <div className="mt-1">
                                <select
                                  id={`dimension_unit-${index}`}
                                  name="dimension_unit"
                                  value={formDataArray[index]?.dimension_unit || 'cm'}
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
                                  id={`invoiceGenerateDate-${index}`}
                                  date={formDataArray[index]?.invoice_generate_date ? new Date(formDataArray[index]?.invoice_generate_date) : undefined} 
                                  setDate={(date) => handleSellerDateChange(date, "invoice_generate_date",index)} 
                                  placeholder="DD-MM-YYYY" 
                                />
                              </div>
      
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="invoiceValue" className="text-[15px] font-inter-medium">Invoice Value</Label>
                                <Input
                                  id={`invoiceValue-${index}`}
                                  name="invoice_value"
                                  value={formDataArray[index]?.invoice_value || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter invoice value"
                                  className="bg-white border"
                                />
                              </div>
      
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="invoiceNumber" className="text-[15px] font-inter-medium">Invoice Number</Label>
                                <Input
                                  id={`invoiceNumber-${index}`}
                                  name="invoice_number"
                                  value={formDataArray[index]?.invoice_number || ''}
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
                                  id={`delivery_address-${index}`}
                                  name="delivery_address"
                                  value={formDataArray[index]?.delivery_address || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter delivery address"
                                  className="bg-white border"
                                />
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Order Ready Date</Label>
                                <DatePicker 
                                  id={`orderReadyDate-${index}`}
                                  date={formDataArray[index]?.order_ready_date ? new Date(formDataArray[index]?.order_ready_date) : undefined} 
                                  setDate={(date) => handleSellerDateChange(date, "order_ready_date",index)} 
                                  placeholder="DD-MM-YYYY" 
                                />
                              </div>
                              
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Order Dispatch Date</Label>
                                <DatePicker 
                                  id={`orderDispatchDate-${index}`}
                                  date={formDataArray[index]?.order_dispatch_date ? new Date(formDataArray[index]?.order_dispatch_date) : undefined} 
                                  setDate={(date) => handleSellerDateChange(date, "order_dispatch_date",index)} 
                                  placeholder="DD-MM-YYYY" 
                                />
                              </div>
                              {formDataArray[index]?.order_dispatch_date && (
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Order Delivery Date</Label>
                                <DatePicker 
                                  id={`orderDeliveryDate-${index}`}
                                  date={formDataArray[index]?.order_delivery_date ? new Date(formDataArray[index]?.order_delivery_date) : undefined} 
                                  setDate={(date) => handleSellerDateChange(date, "order_delivery_date",index)} 
                                  placeholder="DD-MM-YYYY" 
                                />
                              </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })}
            </Accordion>
          </div>
        )}

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

// Seller Dropdown Component
function SellerDropdown({
  sellers,
  value,
  onSelect,
}: {
  sellers: Seller[]
  value: string | null
  onSelect: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? sellers.find((seller) => seller.id === value)?.name : "Select seller..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search seller..." />
          <CommandList>
            <CommandEmpty>No seller found.</CommandEmpty>
            <CommandGroup>
              {sellers.map((seller) => (
                <CommandItem
                  key={seller.id}
                  value={seller.name}
                  onSelect={() => {
                    onSelect(seller.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === seller.id ? "opacity-100" : "opacity-0")} />
                  {seller.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
