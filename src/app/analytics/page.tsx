"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {  RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/DateRangePicker"
import AnalyticsChart from "./analytics-chart"
import axiosInstance from "@/lib/axios"

  
  const timeRanges = ["Today", "Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months"]

const AnalyticsDashboard = ()=>{

    const [metrics,setMetrics] = useState([
      { title: "Inquiries", value: "0", change: "0" },
      { title: "Offers", value: "0", change: "0" },
      { title: "Orders", value: "120", change: "+2" },
      { title: "Buyers", value: "58", change: "+10" },
    ])

    const [selectedMetric, setSelectedMetric] = useState("Inquiries")
    const [selectedTimeRange, setSelectedTimeRange] = useState("Today")
    const [selectedDataType, setSelectedDataType] = useState("Both")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [refresh, setRefresh] = useState(false); // Refresh trigger

    const dataTypeLabels: Record<string, string> = {
      Dom: "Domestic",
      Int: "International",
      Both: "Both",
      DomOffers: "Domestic",
      IntOffers: "International",
      BothOffers: "Both",
    };
    

    useEffect(() => {
      if (selectedMetric === "Offers") {
        setSelectedDataType("BothOffers"); // Change to offers when selected
      } else {
        setSelectedDataType("Both"); // Reset to inquiries when metric changes
      }
    }, [selectedMetric]); 
  

    const fetchInquiryMetrics = async () => {


      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.log("User is not authenticated.");
          return;
        }
        const response = await axiosInstance.get("/analytics/total-inquiries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          
        });
        if (response.data) {
          setMetrics((prevMetrics) =>
            prevMetrics.map((metric) => {
              if (metric.title === "Inquiries") {
                return {
                  ...metric,
                  value: response.data.total_inquiries || 0,
                  change: `+${response.data.last_month_inquiries || 0}`,
                };
              }
              if (metric.title === "Offers") {
                return {
                  ...metric,
                  value: response.data.total_offers || 0,
                  change: `+${response.data.last_month_offers || 0}`,
                };
              }
              return metric;
            })
          );    
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      }
    };
    
    useEffect(() => {
      fetchInquiryMetrics();
    }, [refresh]);



    return(
        <>
      
      <div className="flex justify-end mt-12 mb-4">
        <button className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setRefresh((prev) => !prev)}>
          <RefreshCw className="h-3 w-3" /><span className="text-[12px] font-inter-semibold cursor-pointer">Refresh all</span>
        </button>
      </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card
              key={metric.title}
              className={`cursor-pointer m-2 py-2 ${selectedMetric === metric.title ? "border-1  border-[#000]" : "shadow-none bg-[#f2f2f2] text-[#bcbcbc]"}`}
              onClick={() => setSelectedMetric(metric.title)}
            >
              <CardContent>
                <div className="text-[20px] font-inter-semibold">{metric.title}</div>
                <div className="text-[30px] font-inter-extrabold">{metric.value}</div>
                <p className="text-sm text-[#7f7f7f] font-inter-medium"><span className="text-[#70ad4a] font-inter-semibold">{metric.change}</span> from last month</p>
              </CardContent>
            </Card>
          ))}
      </div>
      <Card className="pt-3">
        <CardHeader className="grid grid-cols-4 items-center">
          <CardTitle className="font-inter-semibold col-span-1">Overall {selectedMetric}</CardTitle>
          <div className="col-span-3">
            <div className="flex flex-col sm:flex-row items-start justify-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange} className="w-full lg:w-auto">
              <TabsList>
                {timeRanges.map((range) => (
                  <TabsTrigger key={range} value={range} className="text-[11px] cursor-pointer font-inter-medium">
                    {range}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer text-[11px] px-8 py-0 font-inter-medium">{dataTypeLabels[selectedDataType] || selectedDataType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="cursor-pointer">
                {selectedMetric === "Inquiries" ? (
                    <>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("Dom")}>Domestic</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("Int")}>International</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("Both")}>Both</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("DomOffers")}>Domestic</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("IntOffers")}>International</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("BothOffers")}>Both</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>                
              </DropdownMenu>
              <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} className="cursor-pointer" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-full">
              <AnalyticsChart
                selectedMetric={selectedMetric}
                selectedTimeRange={selectedTimeRange}
                selectedDataType={selectedDataType}
                dateRange={dateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </>

    )
}

export default AnalyticsDashboard;