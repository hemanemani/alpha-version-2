"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CancellationsDomesticInquiriesDashboard from "./domestic/page";
import CancellationsInternationalInquiriesDashboard from "./international/page";


export default function CancellationTab() {
  const [value, setValue] = useState<string>('domestic');
  return(
    <div className="w-full h-[500px]">
    <Tabs defaultValue="domestic" value={value} onValueChange={setValue} className="w-full">
      <TabsList className="bg-white gap-2">
        <TabsTrigger value="domestic" className="text-black data-[state=active]:shadow-none data-[state=active]:underline px-4 py-2 bg-transparent cursor-pointer">
          Domestic
        </TabsTrigger>
        <TabsTrigger value="international" className="text-black data-[state=active]:shadow-none data-[state=active]:underline px-4 py-2 bg-transparent cursor-pointer">
          International
        </TabsTrigger>
      </TabsList>

      <TabsContent value="domestic" className="p-4">
        <CancellationsDomesticInquiriesDashboard />
      </TabsContent>
      <TabsContent value="international" className="p-4">
        <CancellationsInternationalInquiriesDashboard />
      </TabsContent>
    </Tabs>
  </div>

  )
}

