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

  
  const timeRanges = ["Today", "Last 7 days", "Last 30 days", "Last month", "Last 3 months"]

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
          <RefreshCw className="h-3 w-3" /><span className="text-[12px] font-bold cursor-pointer">Refresh all</span>
        </button>
      </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card
              key={metric.title}
              className={`cursor-pointer ${selectedMetric === metric.title ? "border-primary" : ""}`}
              onClick={() => setSelectedMetric(metric.title)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change} from last month</p>
              </CardContent>
            </Card>
          ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overall {selectedMetric}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-4">
            <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                {timeRanges.map((range) => (
                  <TabsTrigger key={range} value={range} className="text-xs sm:text-sm">
                    {range}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{selectedDataType}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                {selectedMetric === "Inquiries" ? (
                    <>
                      <DropdownMenuItem onSelect={() => setSelectedDataType("Dom")}>Dom</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSelectedDataType("Int")}>Int</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSelectedDataType("Both")}>Both</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onSelect={() => setSelectedDataType("DomOffers")}>Dom Offers</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSelectedDataType("IntOffers")}>Int Offers</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSelectedDataType("BothOffers")}>Both Offers</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>                
              </DropdownMenu>
              <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>
          </div>
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