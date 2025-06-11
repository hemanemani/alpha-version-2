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
      <TabsList className="bg-white dark:bg-[#030712] gap-2">
        <TabsTrigger value="domestic" className="text-[#7F7F7F] dark:text-[#fff] data-[state=active]:text-[#000] data-[state=active]:shadow-none data-[state=active]:underline px-4 py-2 bg-transparent cursor-pointer font-inter-semibold">
          Domestic
        </TabsTrigger>
        <TabsTrigger value="international" className="text-[#7F7F7F] dark:text-[#fff] data-[state=active]:text-[#000] data-[state=active]:shadow-none data-[state=active]:underline px-4 py-2 bg-transparent cursor-pointer font-inter-semibold">
          International
        </TabsTrigger>
      </TabsList>

      <TabsContent value="domestic" className="px-4">
        <CancellationsDomesticInquiriesDashboard />
      </TabsContent>
      <TabsContent value="international" className="px-4">
        <CancellationsInternationalInquiriesDashboard />
      </TabsContent>
    </Tabs>
  </div>

  )
}

