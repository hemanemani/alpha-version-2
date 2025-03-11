"use client";

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateInput } from "../../../../components/DateInput"
import { Textarea } from "@/components/ui/textarea";


export default function InquiryForm() 
    {
  const [inquiryDate, setInquiryDate] = useState<Date | undefined>(undefined);
  const [firstContactDate, setFirstContactDate] = useState<Date | undefined>(undefined)
  const [secondContactDate, setSecondContactDate] = useState<Date | undefined>(undefined)
  const [thirdContactDate, setThirdContactDate] = useState<Date | undefined>(undefined)

  return (
    <div className="px-20 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryNumber" className="text-[15px]">Inquiry Number</Label>
          <Input id="inquiryNumber" placeholder="Please enter inquiry number" className="bg-white"/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryDate" className="text-[15px]">Inquiry Date</Label>
          <div className="bg-white rounded-md border">
            <DateInput
              id="inquiryDate"
              value={inquiryDate}
              onChange={(date) => setInquiryDate(date ?? undefined)}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="name" className="text-[15px]">Name</Label>
          <Input id="name" placeholder="Please enter customer name" className="bg-white"/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="mobileNumber" className="text-[15px]">Mobile Number</Label>
          <Input id="mobileNumber" placeholder="Please enter mobile number" className="bg-white"/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="location" className="text-[15px]">Location (City)</Label>
          <Input id="location" placeholder="Please enter city name" className="bg-white"/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="productCategories" className="text-[15px]">Product Categories</Label>
          <Input id="productCategories" placeholder="Please enter product categories" className="bg-white"/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="specificProduct" className="text-[15px]">Specific Product</Label>
          <Input id="specificProduct" placeholder="Please enter name of specific products" className="bg-white"/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryThrough" className="text-[15px]">Inquiry Through</Label>
          <Input id="inquiryThrough" placeholder="Please enter inquiry through" className="bg-white"/>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="inquiryReference" className="text-[15px]">Inquiry Reference</Label>
          <Input id="inquiryReference" placeholder="Please enter inquiry reference" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="firstContactDate" className="text-[15px]">1st Contact Date</Label>
          <div className="bg-white rounded-md border">
            <DateInput id="firstContactDate" value={firstContactDate} onChange={setFirstContactDate} />
          </div>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="firstResponse" className="text-[15px]">1st Response</Label>
          <Input id="firstResponse" placeholder="Please enter 1st response" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="secondContactDate" className="text-[15px]">2nd Contact Date</Label>
          <div className="bg-white rounded-md border">
            <DateInput id="secondContactDate" value={secondContactDate} onChange={setSecondContactDate} />
          </div>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="secondResponse" className="text-[15px]">2nd Response</Label>
          <Input id="secondResponse" placeholder="Please enter 2nd response" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="thirdContactDate" className="text-[15px]">3rd Contact Date</Label>
          <div className="bg-white rounded-md border">
            <DateInput id="thirdContactDate" value={thirdContactDate} onChange={setThirdContactDate} />
          </div>
        </div>
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="thirdResponse" className="text-[15px]">3rd Response</Label>
          <Input id="thirdResponse" placeholder="Please enter 3rd response" className="bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
        <div className="space-y-2 w-[80%]">
          <Label htmlFor="name" className="text-[15px]">Notes</Label>
          <Textarea id="notes" placeholder="Enter notes..." className="w-full p-2 h-28 border rounded-md bg-white" />
        </div>
      </div>
    </div>
  )
}


