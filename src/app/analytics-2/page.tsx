"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger,TabsContent } from "@/components/ui/tabs"
import {  Info, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/DateRangePicker"
import AnalyticsChart from "./analytics-chart"
import axiosInstance from "@/lib/axios"
import { SkeletonCard } from "@/components/SkeletonCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SocialPieChart } from "@/components/SocialPieChart"
import { LocationBarChart } from "@/components/LocationBarChart"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

  
  const timeRanges = ["Today", "Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months"]

  

const AnalyticsDashboard = ()=>{

    const [metrics,setMetrics] = useState([
      { title: "Inquiries", value: "0", change: "0", conversionOffers:"0", conversionCancellations:"0", unResponsiveInquiries:"0", pendingInquiries:"0" },
      { title: "Offers", value: "0", change: "0" },
      { title: "Orders", value: "120", change: "+2" },
      { title: "Ads", value: "58", change: "+10" },
    ])

    const [selectedMetric, setSelectedMetric] = useState("Inquiries")
    const [selectedTimeRange, setSelectedTimeRange] = useState("Today")
    const [selectedDataType, setSelectedDataType] = useState("Both")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [refresh, setRefresh] = useState(false); // Refresh trigger
    const [isLoading, setIsLoading] = useState(true);
    const [averages, setAverages] = useState({
      averageInqFCD: 0,
      averageInqTCD: 0,
    });

    const [topCategoriesData, setTopCategoriesData] = useState<
      { category: string; inquiries: number }[]
    >([]);
    const [topProductsData, setTopProductsData] = useState<
    { product: string; count: number }[]
  >([]);
    


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
                  value: (response.data.totalInquiriesCount || 0 ) + (response.data.totalInternationalCount || 0 ),
                  change: (response.data.thisMonthtotalInquiries || 0 ) + (response.data.thisMonthtotalInternationalInquiries || 0 ),
                  conversionOffers:
                  (response.data.totalInquiriesCount || 0) > 0
                    ? String(
                        ((response.data.totalDomesticOffers || 0) /
                        response.data.totalInquiriesCount) * 100
                      )
                    : "0",
                    conversionCancellations: (response.data.totalInquiriesCount || 0) > 0
                    ? String (
                        ((response.data.totalDomesticCancellations || 0) /
                        response.data.totalInquiriesCount) * 100
                      )
                    : "0",
                    unResponsiveInquiries:(response.data.inquiryThirdContentNullCount || 0 ),
                    pendingInquiries :(response.data.inquiryThirdContentNotNullCount || 0 ),
                    
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

          setAverages({
            averageInqFCD: response.data.averageInqFCD || 0,
            averageInqTCD: response.data.averageInqTCD || 0,
          });

          setTopCategoriesData(response.data.top5CategoriesWithCounts);
          setTopProductsData(response.data.top5SpecificProductsWithCounts);
           
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      }
      finally {
        setIsLoading(false);
      }
    };
    
    useEffect(() => {
      fetchInquiryMetrics();
    }, [refresh]);



    return(
      <>
      
      <div className="flex justify-end mt-12 mb-4 gap-3">
        <div className="flex items-center space-x-2">
          <Label htmlFor="inquiries-mode" className="text-[12px] font-inter-semibold">Domestic</Label>
            <Switch id="inquiries-mode" />
          <Label htmlFor="inquiries-mode" className="text-[12px] font-inter-semibold">International</Label>
        </div>
        |
        <button 
        className="flex items-center gap-2 text-sm cursor-pointer" 
        onClick={() => {
          setIsLoading(true);
          setRefresh((prev) => !prev)
        }}
        >
          <RefreshCw className="h-3 w-3" /><span className="text-[12px] font-inter-semibold cursor-pointer">Refresh all</span>
        </button>

      </div>



    <div className="container mx-auto">
            
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4 w-full">
        <TabsList className="w-full">
        {
          metrics.map((metric) => (
            <TabsTrigger key={metric.title} value={metric.title}>
              {metric.title}
            </TabsTrigger>
          ))
        }
        </TabsList>
          {metrics.map((metric) => (
            <TabsContent key={metric.title} value={metric.title}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} height="h-[112px]" />
                  ))
                ) : (
                  <>
                <Card className="p-3 gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Lorem Ipsum</p>
                      </TooltipContent>
                    </Tooltip>

                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-inter-extrabold">
                      {metric.value}
                    </div>
                    <p className="text-sm text-[#71717a] font-inter">
                      <span className="text-[#70ad4a]">+{metric.change}</span> from this month
                    </p>
                  </CardContent>
                </Card>
               
                <Card className="h-[112px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversion to Offers % </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-inter-extrabold">
                        { metric.conversionOffers } %
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="h-[112px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cancelled Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-4xl font-inter-extrabold">
                    {metric.conversionCancellations} %</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[112px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unresponsive Inquires</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-4xl font-inter-extrabold">
                    {metric?.unResponsiveInquiries || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[112px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Inquires</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-4xl font-inter-extrabold">
                    {metric?.pendingInquiries || 0}</div>
                    </CardContent>
                  </Card>
                  </>
                   )}
                </div>
            </TabsContent>
          ))}
       

      </Tabs>

        

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

      <div className="grid grid-cols-2 mt-6 gap-6">
          <>
            <SocialPieChart />
        
            <LocationBarChart />
          </>
      </div>

      {/* Key Insights */}
      <Card className="mt-6 py-6">
          <CardHeader>
            <CardTitle className="font-inter-semibold text-2xl pt-4">Key Insights</CardTitle>
            <CardDescription className="text-sm text-[#71717a] font-inter">Important metrics and observations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>Average Inquiry Response Time : {averages.averageInqFCD}  </li>
              <li>Average Days Inquiry Pending : {averages.averageInqTCD}  </li>
            </ul>
          </CardContent>
        </Card>


        <div className="grid grid-cols-2 my-6 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Categories </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common categories with inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategoriesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.category}</div>
                    <div className="font-semibold">{item.inquiries}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Products</CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.product}</div>
                    <div className="font-semibold">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
      
    </div>

      </>       

    )
}

export default AnalyticsDashboard;