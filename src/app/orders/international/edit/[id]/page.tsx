"use client";

import { useEffect, useState,useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { DatePicker } from "@/components/date-picker";
import { Loader, SquarePlus, SquareX } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";
import { OrderItem } from "@/types/order";
import { format } from "date-fns";
import { SellerShippingDetailsItem } from "@/types/sellershippingdetails";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import React from "react";
// import { toWords } from 'number-to-words';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"


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
  rate_per_kg: number;
  total_kg: number;
  hsn: string;
  product_total_amount : number;
}

type InquiryData = {
  name: string;
  mobile_number:string;
};

interface User {
  id: string;
}

const EditInternationalOrderForm =  () =>
  {
    const router = useRouter();
    const { id } = useParams<{ id: string }>() ?? {};

    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [inquiryData, setInquiryData] = useState<InquiryData | null>(null);
    const [isInputLoading, setIsInputLoading] = useState(true);
    const [isMobileDuplicate, setIsMobileDuplicate] = useState("");
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
          rate_per_kg: 0,
          total_kg: 0,
          hsn: '',
          product_total_amount : 0
        },
      ])
    

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
         buyer_final_shipping_value: 0,
         buyer_amount:0,
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
                    id:0,
                    seller_id: 0,
                    seller_name: '',
                    seller_address: '',
                    seller_contact: '',
                    shipping_name: '',
                    amount_paid: 0,
                    amount_paid_date: '',
                    address_line_1: '',
                    address_line_2: '',
                    seller_pincode: '',
                    seller_contact_person_name: '',
                    seller_contact_person_number: '',
                    logistics_agency: '',
                    logistics_through: '',
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
    const [user, setUser] = useState<User | null>(null);
    

    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
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
          console.error('Failed to fetch inquiries', response.status);
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setIsLoading(false);
        setIsInputLoading(false);
      }
    }
        
    fetchSellers();
    }, []);


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found in localStorage');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await axiosInstance.get(`international-orders/by-offer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const orderData = response.data.international_order;
        const inquiry = response.data.international_inquiry;


        setFormData(orderData);

         let sellerdetails = orderData.sellerdetails;

      if (typeof sellerdetails === 'string') {
        try {
          sellerdetails = JSON.parse(sellerdetails);

        } catch (error) {
          console.error("Failed to parse sellerdetails JSON:", error);
          sellerdetails = [];
        }
      }
      const initialProducts = (Array.isArray(sellerdetails) && sellerdetails.length > 0
        ? sellerdetails
        : [
            {
              id: 1,
              product_name: '',
              quantity: '',
              seller_offer_rate: '',
              gst: '',
              buyer_offer_rate: '',
              buyer_order_amount: '',
              hsn: '',
              rate_per_kg: '',
              total_kg: '',
              product_total_amount: 0,
              seller_assigned: null,
            },
          ]
      ).map((product, index) => ({
        ...product,
        id: index + 1,
      }));

      //   const initialProducts = (orderData.sellerdetails || []).map((product:Product, index:number) => ({
      //   ...product,
      //   id: index + 1,
      // }));

      setProducts(initialProducts);

       
      setInquiryData(inquiry || null);
      setFormDataArray(orderData.international_sellers || []);

  

      } catch (error) {
        console.error('Error fetching order data:', error);
      }
      finally {
        setIsLoading(false);
        setIsInputLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

      
  useEffect(() => {
    if (inquiryData) {
      setFormData((prev) => ({
        ...prev,
        name: inquiryData.name ?? '',
        mobile_number:inquiryData.mobile_number ?? ''
      }));
    }
  }, [inquiryData]);

  // Get unique assigned sellers
    const uniqueAssignedSellers = useMemo(() => {
      const assignedSellerIds = products.filter((p) => p.seller_assigned).map((p) => p.seller_assigned)
      return [...new Set(assignedSellerIds)].filter(Boolean) as string[]
    }, [products])
  
    
  
  
    
  
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
      const numericFields: (keyof Product)[] = ["seller_offer_rate","buyer_offer_rate", "quantity", "buyer_order_amount"];

      const updated = products.map((product) => {
        if (product.id === id) {
          let cleanedValue: string | number = value;

          // Clean only if it's a numeric field
          if (numericFields.includes(field) && typeof value === "string") {
            cleanedValue = Number(value.replace(/,/g, "")) || 0;
          }

          const updatedProduct = { ...product, [field]: cleanedValue };

          const quantity = Number(updatedProduct.quantity) || 0;
          const buyer_offer_rate = Number(updatedProduct.buyer_offer_rate) || 0;

          updatedProduct.buyer_order_amount = quantity * buyer_offer_rate;

          return updatedProduct;
        }
        return product;
      });

      setProducts(updated);
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
        

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

      const numericFields = ["buyer_amount", "buyer_total_amount"];

      const cleanedValue = numericFields.includes(name)
        ? value.replace(/,/g, "")
        : value;

      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
    };



  useEffect(() => {
      const totalBuyerAmount = products.reduce((sum, product) => {
        const amount = (product.buyer_order_amount) || 0;
        return sum + amount;
      }, 0);
  
      setFormData((prev) => ({
        ...prev,
        buyer_amount: totalBuyerAmount,
      }));
    }, [products]);
  
  
      useEffect(() => {
      const buyerAmount = (formData.buyer_amount) || 0;
      const shipping = (formData.buyer_final_shipping_value) || 0;
  
      const totalAmount = Number(buyerAmount) + Number(shipping);
  
      setFormData((prev) => ({
        ...prev,
        buyer_total_amount: totalAmount,
      }));
    }, [formData.buyer_amount, formData.buyer_final_shipping_value]);
  
  
      function formatAmountInWords(amount: number): string {
        if (amount === 0) return "Zero Rupees";
  
        const ones = [
          "", "One", "Two", "Three", "Four", "Five", "Six",
          "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
          "Thirteen", "Fourteen", "Fifteen", "Sixteen",
          "Seventeen", "Eighteen", "Nineteen",
        ];
  
        const tens = [
          "", "", "Twenty", "Thirty", "Forty", "Fifty",
          "Sixty", "Seventy", "Eighty", "Ninety",
        ];
  
        const numToWords = (n: number): string => {
          if (n < 20) return ones[n];
          if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
          if (n < 1000)
            return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numToWords(n % 100) : "");
          return "";
        };
  
        const crore = Math.floor(amount / 10000000);
        const lakh = Math.floor((amount % 10000000) / 100000);
        const thousand = Math.floor((amount % 100000) / 1000);
        const hundred = Math.floor((amount % 1000) / 100);
        const rest = amount % 100;
  
        let result = "";
  
        if (crore) result += numToWords(crore) + " Crore ";
        if (lakh) result += numToWords(lakh) + " Lakh ";
        if (thousand) result += numToWords(thousand) + " Thousand ";
        if (hundred) result += ones[hundred] + " Hundred ";
        if (rest) result += (hundred ? "and " : "") + numToWords(rest) + " ";
  
        return result.trim() + " Rupees";
      }
  
  
  
          useEffect(() => {
            const updated = formDataArray.map((form, index) => {
              const sellerId = uniqueAssignedSellers[index];
              const productsForSeller = products.filter(
                (product) => product.seller_assigned === sellerId
              );
  
              const productAmount = productsForSeller.reduce(
                (sum, product) => sum + (Number(product.buyer_order_amount) || 0),
                0
              );
  
              const packagingExpenses = parseFloat(form.packaging_expenses || "0");
              const otherExpenses = parseFloat(form.expenses || "0");
  
              const total = productAmount + packagingExpenses + otherExpenses;
              const amountInWords = formatAmountInWords(total);
  
              return {
                ...form,
                invoicing_amount: productAmount.toFixed(2),
                invoicing_total_amount: total.toFixed(2),
                total_amount_in_words: amountInWords,
              };
            });
  
            let hasChanged = false;
            for (let i = 0; i < updated.length; i++) {
              if (
                updated[i].total_amount_in_words !== formDataArray[i].total_amount_in_words ||
                updated[i].invoicing_total_amount !== formDataArray[i].invoicing_total_amount ||
                updated[i].invoicing_amount !== formDataArray[i].invoicing_amount
              ) {
                hasChanged = true;
                break;
              }
            }
  
            if (hasChanged) {
              setFormDataArray(updated);
            }
  
  },[products, uniqueAssignedSellers, formDataArray]);
  

const handleFormDataChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      index: number
    ) => {
      const { name, value } = e.target;

      const numericFields = ["packaging_expenses", "expenses", "invoicing_amount", "invoicing_total_amount"];

      const cleanedValue = numericFields.includes(name)
      ? value.replace(/,/g, "")
      : value;


      const updatedFormData = [...formDataArray];
      updatedFormData[index] = {
        ...updatedFormData[index],
        [name]: cleanedValue,
      };
      setFormDataArray(updatedFormData);    
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
            international_sellers: formDataArray,
            user_id: user?.id,
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
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input id="name" name="name" value={formData.name ?? ''} onChange={handleChange} placeholder="Please enter name" className={`bg-white`} /> 
            }
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="contactNumber" className="text-[15px] font-inter-medium">Contact Number</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
              <>
              <Input id="contactNumber" name="mobile_number" value={formData?.mobile_number ?? ''} onChange={handleChange} placeholder="Please enter contact number" className={`bg-white ${!!isMobileDuplicate ? "border-red-500" : "border"}`} />
              {isMobileDuplicate && (
                <p className="text-red-600 text-[13px] font-medium mt-1">{isMobileDuplicate}</p>
              )}
              </>
            }
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-2 mt-4">
          <div className="space-y-2 w-[100%]">
               <div className="flex justify-end">
                    <Button type="button" className="bg-transparent text-black rounded-small text-[11px] px-2 py-1 captitalize border-2 border-[#d9d9d9] hover:bg-transparent cursor-pointer font-inter-semibold" onClick={()=>addProduct()}>
                    + Add New 
                  </Button>
                </div>
            {/* Products Table */}
            <Card className="">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="h-[55px]">
                      <TableRow>
                        <TableHead className="w-[200px]">Product Name</TableHead>
                        <TableHead className="w-[200px]">Seller</TableHead>
                        <TableHead className="w-[100px]">Quantity</TableHead>
                        <TableHead className="w-[150px] text-center">Seller Offer Rate <br />per Kg</TableHead>
                        <TableHead className="w-[100px]">GST (%)</TableHead>
                        <TableHead className="w-[150px] text-center">Buyer Offer Rate <br />per Kg</TableHead>
                        <TableHead className="w-[150px]">Buyer Order Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="h-[55px]">
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Input
                              value={product.product_name}
                              onChange={(e) => updateProduct(product.id, "product_name", e.target.value)}
                              placeholder="Enter product name"
                              className="w-[180px]"
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
                              placeholder="Quantity"
                              value={
                                product.quantity
                                  ?  Number(product.quantity).toLocaleString("en-IN") : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, "");
                                const numericValue = rawValue.replace(/\D/g, "");
                                updateProduct(product.id, "quantity", numericValue);
                              }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Input
                              value={
                                product.seller_offer_rate
                                  ?  Number(product.seller_offer_rate).toLocaleString("en-IN") : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, "");
                                const numericValue = rawValue.replace(/\D/g, "");
                                updateProduct(product.id, "seller_offer_rate", numericValue);
                              }}
                              placeholder="Seller Offer Rate"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.gst === 0 ? "" : product.gst}
                              onChange={(e) => updateProduct(product.id, "gst", e.target.value)}
                              placeholder="GST"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={
                                product.buyer_offer_rate
                                  ?  Number(product.buyer_offer_rate).toLocaleString("en-IN") : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, "");
                                const numericValue = rawValue.replace(/\D/g, "");
                                updateProduct(product.id, "buyer_offer_rate", numericValue);
                              }}
                              placeholder="Buyer Offer Rate"
                            />
                          </TableCell>
                          <TableCell className="font-inter-semibold">
                            ₹{(product.buyer_order_amount || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <button
                                type="button"
                                onClick={()=> addProduct()}
                                className="cursor-pointer mr-1"
                                title="Add More"
                                
                              >
                            <SquarePlus className="h-6 w-6 text-green-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-500 text-lg cursor-pointer"
                              title="Remove"
                            >
                              <SquareX className="h-6 w-6 text-red-800" />
                            </button>
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

        <h2 className="text-[16px] font-inter-semibold underline mb-4">Buyer Details</h2>
          <Card className="mb-4">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="buyerGstNumber" className="text-[15px] font-inter-medium">Buyer GST Number</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="buyerGstNumber"
                      name="buyer_gst_number"
                      value={formData.buyer_gst_number || ''}
                      placeholder="Please enter buyer GST number"
                      onChange={handleChange}
                      className="bg-white border"
                    />
                  }
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="buyerPAN" className="text-[15px] font-inter-medium">Buyer PAN</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="buyerPAN"
                      name="buyer_pan"
                      value={formData.buyer_pan || ''}
                      placeholder="Please enter buyer PAN"
                      onChange={handleChange}
                      className="bg-white border"
                    />
                  }
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="buyerBankDetails" className="text-[15px] font-inter-medium">Buyer Bank Details</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="buyerBankDetails"
                      name="buyer_bank_details"
                      value={formData.buyer_bank_details || ''}
                      placeholder="Please enter bank details"
                      onChange={handleChange}
                      className="bg-white border"
                    />
                  }
                </div>
              </div>

              


              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="buyerAmount" className="text-[15px] font-inter-medium">Amount</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="buyerAmount"
                      name="buyer_amount"
                      value={
                        formData.buyer_amount
                        ?  Number(formData.buyer_amount).toLocaleString("en-IN") : ""
                        }
                      placeholder="Please enter amount"
                      onChange={handleChange}
                      className="bg-white border"
                      readOnly
                    />
                  }
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="shippingEstimateValue" className="text-[15px] font-inter-medium">Shipping Estimate Value</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="shippingEstimateValue"
                      name="shipping_estimate_value"
                      value={formData.shipping_estimate_value || ''}
                      placeholder="Please enter shipping estimate value"
                      onChange={handleChange}
                      className="bg-white border"
                    />
                  }
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="buyerFinalShippingValue" className="text-[15px] font-inter-medium">Final Shipping Value</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="buyerFinalShippingValue"
                      name="buyer_final_shipping_value"
                      value={formData.buyer_final_shipping_value || ''}
                      placeholder="Please enter final shipping value"
                      onChange={handleChange}
                      className="bg-white border"
                    />
                  }
                </div>
                
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="buyerTotalAmount" className="text-[15px] font-inter-medium">Total Amount</Label>
                    <Input
                      id="buyerTotalAmount"
                      name="buyer_total_amount"
                      value={
                          formData.buyer_total_amount
                            ?  Number(formData.buyer_total_amount).toLocaleString("en-IN") : ""
                        }
                      placeholder="Please enter total amount"
                      onChange={handleChange}
                      className="bg-white border"
                      readOnly
                    />
                </div>
                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="amountReceived" className="text-[15px] font-inter-medium">Amount Received</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <Input
                      id="amountReceived"
                      
                      name="amount_received"
                      value={formData.amount_received || ''}
                      placeholder="Please enter amount received"
                      onChange={handleChange}
                      className="bg-white border"
                    />
                  }
                </div>

                <div className="space-y-2 w-[80%]">
                  <Label htmlFor="amountReceivedDate" className="text-[15px] font-inter-medium">Amount Received Date</Label>
                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                    <DatePicker 
                      id="amoundReceivedDate"
                      date={formData.amount_received_date ? new Date(formData.amount_received_date) : undefined} 
                      setDate={(date) => handleOrderDateChange(date, "amount_received_date")} 
                      placeholder="DD-MM-YYYY" 
                    />
                  }
                </div>

                
              </div>
          </CardContent>
        </Card>
              

    {/*********************************** shipping details **************************************/}
      

       {/* Seller Sections */}
      {uniqueAssignedSellers.length > 0 && (
        
        <div className="space-y-6">
          <h2 className="text-[16px] font-inter-semibold mb-4 underline">Seller Information</h2>
          <Accordion type="multiple" className="space-y-4">
            {uniqueAssignedSellers.map((sellerId,index) => {
              const seller = sellers.find((s) => s.id === sellerId)
              if (!seller) return null

              const productsForSeller = products.filter(
                (product) => product.seller_assigned === sellerId
              );
              
              return (
                <Card key={sellerId} className="gap-0">
                  <CardHeader>
                    <CardTitle className="mt-5 text-[18px]">Seller #{index + 1} {seller.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" defaultValue={["seller", "invoice", "packaging"]}>
                      <AccordionItem value="seller">
                        <AccordionTrigger className="font-inter-semibold text-[15px] underline">Seller Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Seller Name</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  value={seller.name || ''}
                                  readOnly
                                  className="bg-gray-100 border"
                                />
                                   }
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
      
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Seller Address</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  value={seller.pickup_address || ''}
                                  readOnly
                                  className="bg-gray-100 border"
                                />
                                }
                              </div>
      
                              <div className="space-y-2 w-[80%]">
                                <Label className="text-[15px] font-inter-medium">Seller Contact</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  value={seller.mobile_number || ''}
                                  readOnly
                                  className="bg-gray-100 border"
                                />
                                }
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`shippingName-${index}`} className="text-[15px] font-inter-medium">Shipping Name</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`shippingName-${index}`}
                                  name="shipping_name"
                                  value={formDataArray[index]?.shipping_name || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter name"
                                  className="bg-white border"
                                />
                                }
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`amountPaid-${index}`} className="text-[15px] font-inter-medium">Amount Paid</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                  <Input
                                    id={`amountPaid-${index}`}
                                    name="amount_paid"
                                    value={formDataArray[index]?.amount_paid || ''}
                                    placeholder="Please enter amount paid"
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    className="bg-white border"
                                  />
                                }
                              </div>

                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`amountPaidDate-${index}`} className="text-[15px] font-inter-medium">Amount Paid Date</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                  <DatePicker 
                                    id={`amountPaidDate-${index}`}
                                    date={formDataArray[index]?.amount_paid_date ? new Date(formDataArray[index].amount_paid_date) : undefined} 
                                    setDate={(date) => handleSellerDateChange(date, "amount_paid_date",index)} 
                                    placeholder="DD-MM-YYYY" 
                                  />
                                }
                              </div>

                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="logisticsThrough" className="text-[15px] font-inter-medium">Logistics Through</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                   <select
                                      id={`logisticsThrough-${index}`}
                                      name="logistics_through"
                                      value={formDataArray[index]?.logistics_through || ''}
                                      onChange={(e) => handleFormDataChange(e, index)}
                                      className="w-[100%] p-[8px] text-[13px] text-[#827482] border-2 border-[#e5e7eb] bg-white text-sm rounded-lg cursor-pointer"
                                    >
                                      <option value="placeholder" className="cursor-pointer">Select Logistics Through</option>
                                      <option value="seller_fulfilled" className="cursor-pointer">Seller Fulfilled</option>
                                      <option value="ship_rocket" className="cursor-pointer">Shiprocket</option>
                                    </select>
                                }
                              </div>

                              
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`address_line_1-${index}`} className="text-[15px] font-inter-medium">Address Line 1</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`address_line_1-${index}`}
                                  name="address_line_1"
                                  value={formDataArray[index]?.address_line_1 || ''}
                                  maxLength={50}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Max. 50 characters"
                                  className="bg-white border"
                                />
                                }
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="address2" className="text-[15px] font-inter-medium">Address Line 2</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`address2-${index}`}
                                  name="address_line_2"
                                  value={formDataArray[index]?.address_line_2 || ''}
                                  maxLength={50}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Max. 50 characters"
                                  className="bg-white border"
                                />
                                }
                              </div>
      
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="sellerPincode" className="text-[15px] font-inter-medium">Pincode</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`sellerPincode-${index}`}
                                  name="seller_pincode"
                                  value={formDataArray[index]?.seller_pincode || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Enter Seller Pincode"
                                  className="bg-white border"
                                />
                                }
                              </div>
                              
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="sellerContactPersonName" className="text-[15px] font-inter-medium">Contact Person Name</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`sellerContactPersonName-${index}`}
                                  name="seller_contact_person_name"
                                  value={formDataArray[index]?.seller_contact_person_name || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter contact person"
                                  className="bg-white border"
                                />
                                }
                              </div>
                              <div className="space-y-2 w-[80%]">
                                <Label htmlFor="sellerContactNumber" className="text-[15px] font-inter-medium">Contact Person Number</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`sellerContactPersonNumber-${index}`}
                                  name="seller_contact_person_number"
                                  value={formDataArray[index]?.seller_contact_person_number || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="Please enter phone number"
                                  className="bg-white border"
                                />
                                }
                              </div>
                            </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="invoice">
                        <AccordionTrigger className="font-inter-semibold text-[15px] underline">Invoice Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                            <div className="space-y-2 w-[80%]">
                                <Label htmlFor={`invocingInvoiceGenerateDate-${index}`} className="text-[15px] font-inter-medium">Invoice Generate Date</Label>
                                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                  <DatePicker 
                                  id={`invocingInvoiceGenerateDate-${index}`}
                                  date={formDataArray[index]?.invoicing_invoice_generate_date ? new Date(formDataArray[index]?.invoicing_invoice_generate_date) : undefined} 
                                  setDate={(date) => handleSellerDateChange(date, "invoicing_invoice_generate_date",index)} 
                                  placeholder="DD-MM-YYYY" 
                                 
                                />
                                  }
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor={`invoicingInvoiceNumber-${index}`} className="text-[15px] font-inter-medium">Invoice Number</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                id={`invoiceingInvoiceNumber-${index}`}
                                name="invoicing_invoice_number"
                                value={formDataArray[index]?.invoicing_invoice_number || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter invoice number"
                                className="bg-white border"
                                />
                              }
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor={`invoiceTo-${index}`} className="text-[15px] font-inter-medium">Invoice To</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                id={`invoiceTo-${index}`}
                                name="invoice_to"
                                value={formDataArray[index]?.invoice_to || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter invoice to"
                                className="bg-white border"
                                />
                              }
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor={`invoiceAddress-${index}`} className="text-[15px] font-inter-medium">Invoice Address</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                id={`invoiceAddress-${index}`}
                                name="invoice_address"
                                value={formDataArray[index]?.invoice_address || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter invoice address"
                                className="bg-white border"
                                />
                              }
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor={`invoiceGSTIN-${index}`} className="text-[15px] font-inter-medium">Invoice GSTIN</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                id={`invoiceGSTIN-${index}`}
                                name="invoice_gstin"
                                value={formDataArray[index]?.invoice_gstin || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter invoice GSTIN"
                                className="bg-white border"
                                />
                              }
                            </div>
                          </div>
                          <Card>
                                <CardContent className="p-0">
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader className="h-[55px]">
                                        <TableRow>
                                          <TableHead>Product Name</TableHead>
                                          <TableHead>HSN</TableHead>
                                          <TableHead>Total KG</TableHead>
                                          <TableHead>Rate per KG</TableHead>
                                          <TableHead>Amount</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      

                                      <TableBody className="h-[55px]">
                                        
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
                                                                                                
                                                placeholder="Total KG"
                                                value={
                                                  invoiceproduct.quantity
                                                    ?  Number(invoiceproduct.quantity).toLocaleString("en-IN") : ""
                                                }
                                                onChange={(e) => {
                                                  const rawValue = e.target.value.replace(/,/g, "");
                                                  const numericValue = rawValue.replace(/\D/g, "");
                                                  updateProduct(invoiceproduct.id, "quantity", numericValue);
                                                }}
                                              />
                                            </TableCell>
                                            
                                            <TableCell>
                                              <Input
                                                value={
                                                  invoiceproduct.buyer_offer_rate
                                                    ?  Number(invoiceproduct.buyer_offer_rate).toLocaleString("en-IN") : ""
                                                }
                                                onChange={(e) => {
                                                  const rawValue = e.target.value.replace(/,/g, "");
                                                  const numericValue = rawValue.replace(/\D/g, "");
                                                  updateProduct(invoiceproduct.id, "buyer_offer_rate", numericValue);
                                                }}
                                                
                                                placeholder="Rate per KG"
                                              />
                                            </TableCell>
                                            
                                            <TableCell className="font-inter-semibold">
                                              ₹{(invoiceproduct.buyer_order_amount || 0).toLocaleString("en-IN")}
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
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`invoiceAmount-${index}`}
                                  name="invoicing_amount"
                                  value={
                                      formDataArray[index]?.invoicing_amount
                                        ?  Number(formDataArray[index]?.invoicing_amount).toLocaleString("en-IN") : ""
                                    }
                                  placeholder="Please enter amount"
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  className="bg-white border"
                                />
                              }
                            </div>
                            <div className="space-y-2 w-[80%]">
                                <Label htmlFor="packagingExpenses" className="text-[15px] font-inter-medium">Packaging Expenses</Label>
                                  { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                  <Input
                                    id={`packaging_expenses-${index}`}
                                    name="packaging_expenses"
                                    value={
                                        formDataArray[index]?.packaging_expenses
                                          ?  Number(formDataArray[index]?.packaging_expenses).toLocaleString("en-IN") : ""
                                      }
                                    placeholder="Please enter packaging expenses"
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    className="bg-white border"
                                  />
                                  }
                              </div>
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="expenses" className="text-[15px] font-inter-medium">Other Expenses</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`expenses-${index}`}
                                  name="expenses"
                                  value={
                                    formDataArray[index]?.expenses
                                      ?  Number(formDataArray[index]?.expenses).toLocaleString("en-IN") : ""
                                  }
                                  placeholder="Please enter additional expenses"
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  className="bg-white border"
                                />
                                }
                            </div>
                            </div>
        
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="invoicingTotalAmount" className="text-[15px] font-inter-medium">Total Amount</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`invoicingTotalAmount-${index}`}
                                  name="invoicing_total_amount"
                                  value={
                                    formDataArray[index]?.invoicing_total_amount
                                      ?  Number(formDataArray[index]?.invoicing_total_amount).toLocaleString("en-IN") : ""
                                  }
                                  placeholder="Please enter total amount"
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  className="bg-white border"
                                  readOnly
                                />
                                }
                            </div>
                            <div className="space-y-2 w-[80%]">
                                <Label htmlFor="totalAmountInWords" className="text-[15px] font-inter-medium">Total Amount (in words)</Label>
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                  <Input
                                    id={`totalAmountInWords-${index}`}
                                    name="total_amount_in_words"
                                    value={formDataArray[index]?.total_amount_in_words || ''}
                                    placeholder="e.g., One Thousand Only"
                                    onChange={(e) => handleFormDataChange(e, index)}
                                    className="bg-white border"
                                    readOnly
                                  />
                                }
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
                        <AccordionTrigger className="font-inter-semibold text-[15px] underline">Packaging Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="logisticsAgency" className="text-[15px] font-inter-medium">Logistics Agency</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`logisticsAgency-${index}`}
                                  name="logistics_agency"
                                  value={formDataArray[index]?.logistics_agency || ''}
                                  placeholder="Plese enter logistics agency"
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  className="bg-white border"
                                />
                              }
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="noOfBoxes" className="text-[15px] font-inter-medium">No. of Boxes</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <Input
                                id={`noOfBoxes-${index}`}
                                name="no_of_boxes"
                                value={formDataArray[index]?.no_of_boxes || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter box count"
                                className="bg-white border"
                              />
                              }
                            </div>
    
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="weightPerUnit" className="text-[15px] font-inter-medium">Weight (per unit in Kg)</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <Input
                                id={`weightPerUnit-${index}`}
                                name="weight_per_unit"
                                value={formDataArray[index]?.weight_per_unit || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="weight"
                                className="bg-white border"
                              />
                              }
                            </div>
    
                            
                          </div>
    
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                            <div className="space-y-2 w-[80%]">
                              <Label className="text-[15px] font-inter-medium">Dimensions (L × W × H)</Label>
                              <div className="flex gap-2">
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`length-${index}`}
                                  name="length"
                                  value={formDataArray[index]?.length || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="length"
                                  className="bg-white border"
                                />
                                }
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`width-${index}`}
                                  name="width"
                                  value={formDataArray[index]?.width || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="width"
                                  className="bg-white border"
                                />
                                }
                                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <Input
                                  id={`height-${index}`}
                                  name="height"
                                  value={formDataArray[index]?.height || ''}
                                  onChange={(e) => handleFormDataChange(e, index)}
                                  placeholder="height"
                                  className="bg-white border"
                                />
                                }
                              </div>
                            <div className="mt-1">
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <select
                                id={`dimension_unit-${index}`}
                                name="dimension_unit"
                                value={formDataArray[index]?.dimension_unit || 'cm'}
                                onChange={(e) => handleFormDataChange(e, index)}
                                className="w-[100%] p-[8px] text-[13px] text-[#827482] border-2 border-[#e5e7eb] bg-white text-sm rounded-lg cursor-pointer"                              >
                                <option value="cm">Cm</option>
                                <option value="inch">Inch</option>
                              </select>
                              }
                            </div>
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label className="text-[15px] font-inter-medium">Invoice Generate Date</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                                <DatePicker 
                                id={`invoiceGenerateDate-${index}`}
                                date={formDataArray[index]?.invoice_generate_date ? new Date(formDataArray[index]?.invoice_generate_date) : undefined} 
                                setDate={(date) => handleSellerDateChange(date, "invoice_generate_date",index)} 
                                placeholder="DD-MM-YYYY" 
                              />
                              }
                            </div>
    
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="invoiceValue" className="text-[15px] font-inter-medium">Invoice Value</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <Input
                                id={`invoiceValue-${index}`}
                                name="invoice_value"
                                value={formDataArray[index]?.invoice_value || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter invoice value"
                                className="bg-white border"
                              />
                              }
                            </div>
    
                            
                          </div>
                        
    
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">
                            <div className="space-y-2 w-[80%]">
                              <Label htmlFor="invoiceNumber" className="text-[15px] font-inter-medium">Invoice Number</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <Input
                                id={`invoiceNumber-${index}`}
                                name="invoice_number"
                                value={formDataArray[index]?.invoice_number || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter invoice number"
                                className="bg-white border"
                              />
                              }
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label className="text-[15px] font-inter-medium">Delivery Address</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <Input
                                id={`delivery_address-${index}`}
                                name="delivery_address"
                                value={formDataArray[index]?.delivery_address || ''}
                                onChange={(e) => handleFormDataChange(e, index)}
                                placeholder="Please enter delivery address"
                                className="bg-white border"
                              />
                              }
                            </div>
                            <div className="space-y-2 w-[80%]">
                              <Label className="text-[15px] font-inter-medium">Order Ready Date</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <DatePicker 
                                id={`orderReadyDate-${index}`}
                                date={formDataArray[index]?.order_ready_date ? new Date(formDataArray[index]?.order_ready_date) : undefined} 
                                setDate={(date) => handleSellerDateChange(date, "order_ready_date",index)} 
                                placeholder="DD-MM-YYYY" 
                              />
                              }
                            </div>
                        
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 mb-6 mt-4">

                            <div className="space-y-2 w-[80%]">
                              <Label className="text-[15px] font-inter-medium">Order Dispatch Date</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <DatePicker 
                                id={`orderDispatchDate-${index}`}
                                date={formDataArray[index]?.order_dispatch_date ? new Date(formDataArray[index]?.order_dispatch_date) : undefined} 
                                setDate={(date) => handleSellerDateChange(date, "order_dispatch_date",index)} 
                                placeholder="DD-MM-YYYY" 
                              />
                              }
                            </div>
                            {formDataArray[index]?.order_dispatch_date && (
                            <div className="space-y-2 w-[80%]">
                              <Label className="text-[15px] font-inter-medium">Order Delivery Date</Label>
                              { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                              <DatePicker 
                                id={`orderDeliveryDate-${index}`}
                                date={formDataArray[index]?.order_delivery_date ? new Date(formDataArray[index]?.order_delivery_date) : undefined} 
                                setDate={(date) => handleSellerDateChange(date, "order_delivery_date",index)} 
                                placeholder="DD-MM-YYYY" 
                              />
                              }
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
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between cursor-pointer">
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
                  className="cursor-pointer"
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

export default EditInternationalOrderForm;