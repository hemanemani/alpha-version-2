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
import LocationBarChart from "@/components/LocationBarChart"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import OfferPieChart from "@/components/OfferPieChart"
import  AdsPieChart  from "@/components/AdPieChart"
import OrderStatusPieChart from "@/components/OrderStatusPieChart"
import LogisticsStatusPieChart  from "@/components/LogisticsStatusPieChart"
import SocialPieChart from "@/components/SocialPieChart"


  
  const timeRanges = ["Today", "Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months"]

  
  

const AnalyticsDashboard = ()=>{

  const [showInternational, setShowInternational] = useState(false);


  const defaultMetric = {
    value: "0",
    internationalValue: "0",
    inquiriesTotalCount: "0",
    internationalInquiriesTotalCount:"0",
    inquiriesThisMonthCount : "0",
    internationalChange : "0",
    change: "0",
    conversionOffers: "0",
    conversionCancellations: "0",
    unResponsiveInquiries: "0",
    pendingInquiries: "0",
    conversionOrders: "0",
    totalSampleDispatchedOffers : '0',
    totalSampleDeliveredOffers:'0',
    totalSampleDispatchedPendingOffers: '0',
    averageSampleAmountReceivedOffers:'0',
    averageOfferFCD:'0',
    averagesampleFCD:'0',
    deliveredSampleOffersCount:'0',
    offersNetProfitLoss:'0',
    totalAdViews:'0',
    totalAdReach:'0',
    totalMessages:'0',
    totalMessagesFromUAE:'0',
    totalMessagesFromIndia: '0',
    totalAmountFromUAE:'0',
    totalAmountFromIndia:'0',
    totalAmountSpend:'0',
    costPerMessage:'0',
    totalOrderAmount:'0',
    ordersNetProfitLoss:'0',
    averageOrderValue:'0',
    averageOrderDays:'0',
    pendingOrdersCount:'0',
    ordersAmountReceived:'0',
    ordersAmountPaid:'0',
    ordersFinalShippingValue:'0',
    conversionInternationalOffers:'0',
    conversionInternationalCancellations:'0',
    unResponsiveInternaionalInquiries:'0',
    pendingInternationalInquiries:'0',
    conversionInternationalOrders:'0',
    totalSampleDispatchedInternationalOffers:'0',
    totalSampleDeliveredInternationalOffers:'0',
    totalSampleDispatchedPendingInternationalOffers:'0',
    averageSampleAmountReceivedInternationalOffers:'0',
    averageInternationalOfferFCD : '0',
    averagesampleIOFCD:'0',
    deliveredSampleInternationalOffersCount:'0',
    internationalOffersNetProfitLoss:'0',
    totalInternationalOrderAmount:'0',
    internationalOrdersNetProfitLoss:'0',
    internationalOrdersAmountReceived:'0',
    internationalOrdersAmountPaid:'0',
    internationalOrdersFinalShippingValue:0,
    averageInternationalOrderValue:0,
    averageInternationalOrderDays:'0',
    pendingInternationalOrdersCount:'0',
    internationalCancellationsCount:'0',
    domesticCancellationsCount:'0'
  };
  

    const [metrics,setMetrics] = useState([
      { title: "Inquiries", ...defaultMetric },
      { title: "Offers", ...defaultMetric },
      { title: "Orders", ...defaultMetric, },
      { title: "Ads", ...defaultMetric },
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
    const [internationalAverages, setInternationalAverages] = useState({
      averageInternationalInqFCD: 0,
      averageInternationalInqTCD: 0,
    });
    const [offerInsights, setOfferInsights] = useState({
      offersWithLessThan7Days: 0,
    });
    const [internationalOfferInsights, setInternationalOfferInsights] = useState({
      internationalOffersWithLessThan7Days: 0,
    });
    const [orderInsights, setOrderInsights] = useState({
      fastOrdersDelivered: 0,
      averageFinalShippingValue: 0,
      totalWeighofAllOrders: 0,
      fastInternationalOrdersDelivered : 0,
      averageInternationalFinalShippingValue : 0,
      totalWeighofAllInternationalOrders : 0
    });

    
    const [topCategoriesData, setTopCategoriesData] = useState<
      { category: string; inquiries: number }[]
    >([]);
    const [topInternationalCategoriesData, setTopInternationalCategoriesData] = useState<
    { category: string; inquiries: number }[]
  >([]);

    const [topProductsData, setTopProductsData] = useState<
    { product: string; count: number }[]
    >([]);

    const [topInternationalProductsData, setTopInternationalProductsData] = useState<
    { product: string; count: number }[]
    >([]);
    
    const [topOffersData, setTopOffersData] = useState<
    { offer_number: number; received_sample_amount: number }[]
    >([]);

    const [topInternationalOffersData, setTopInternationalOffersData] = useState<
    { offer_number: number; received_sample_amount: number }[]
    >([]);

    const [top5SpecificProductOfferData, setTop5SpecificProductOfferData] = useState<
    { product: string; count: number }[]
    >([]);

    const [top5SpecificProductInternationalOfferData, setTop5SpecificInternationalProductOfferData] = useState<
    { product: string; count: number }[]
    >([]);
    

    const [top5Orders, setTop5Orders] = useState<{ order_number: number; amount_received: number }[]>([])
    const [top5InternationalOrders, setTop5InternationalOrders ] = useState<{ order_number: number; amount_received: number }[]>([])

    const [top5Seller, setTop5Sellers] = useState<{ seller_name: string; total_orders: number }[]>([])
    const [top5InternationalSeller, setTop5InternationalSellers] = useState<{ seller_name: string; total_orders: number }[]>([])

    const [top10Products, setTop10Products] = useState<{ product_name: string; product_count: number }[]>([])
    const [top10InternationalProducts, setTop10InternationalProducts] = useState<{ product_name: string; product_count: number }[]>([])

    const [top10Payments, setTop10Payments] = useState<{ name: string; amount_received: number }[]>([])
    const [top10InternationalPayments, setTop10InternationalPayments] = useState<{ name: string; amount_received: number }[]>([])




    const dataTypeLabels: Record<string, string> = {
      Dom: "Domestic",
      Int: "International",
      Both: "Both",
      DomOffers: "Domestic",
      IntOffers: "International",
      BothOffers: "Both",
      DomAd: "Domestic",
      IntAd: "International",
      BothAds: "Both",
      DomOrders : "Domestic",
      IntOrders : "International",
      BothOrders : "Both"
    };
    

    useEffect(() => {
      if (selectedMetric === "Offers") {
        setSelectedDataType("BothOffers"); // Change to offers when selected
      } else if(selectedMetric === "Ads") {
        setSelectedDataType("BothAds"); 
      }else{
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
                  inquiriesTotalCount : (response.data.totalInquiriesCount || 0),
                  internationalInquiriesTotalCount : (response.data.totalInternationalCount),
                  inquiriesThisMonthCount : (response.data.thisMonthtotalInquiries || 0 ) + (response.data.thisMonthtotalInternationalInquiries || 0), 
                  value: (response.data.totalDomestic || 0 ),
                  change: (response.data.thisMonthtotalInquiries || 0 ),
                  internationalValue : (response.data.totalInternational || 0 ),
                  internationalChange : (response.data.thisMonthtotalInternationalInquiries || 0),
                  
                  conversionOffers:
                  (response.data.totalInquiriesCount || 0) > 0
                    ? (
                        ((response.data.totalDomesticOffers || 0) /
                        response.data.totalInquiriesCount) * 100).toFixed(2)
                    : "0",
                    conversionCancellations: (response.data.totalInquiriesCount || 0) > 0
                    ? (
                        ((response.data.totalDomesticCancellations || 0) /
                        response.data.totalInquiriesCount) * 100).toFixed(2)
                    : "0",
                    
                    domesticCancellationsCount : (response.data.totalDomesticCancellations),
                    internationalCancellationsCount : (response.data.totalInternationalCancellations),

                    conversionInternationalOffers:
                    (response.data.totalInternationalCount || 0) > 0
                      ? (
                          ((response.data.totalInternationalOffers || 0) /
                          response.data.totalInternationalCount) * 100).toFixed(2)
                      : "0",
                    conversionInternationalCancellations: 
                    (response.data.totalInternationalCount || 0) > 0
                    ?  (
                        ((response.data.totalInternationalCancellations || 0) /
                        response.data.totalInternationalCount) * 100).toFixed(2)
                    : "0",

                    unResponsiveInquiries:(response.data.inquiryThirdContentNullCount || 0 ),
                    unResponsiveInternaionalInquiries:(response.data.internationalInquiryThirdContentNullCount || 0 ),
                    pendingInquiries :(response.data.inquiryThirdContentNotNullCount || 0 ),
                    pendingInternationalInquiries :(response.data.internationalInquiryThirdContentNotNullCount || 0 ),
                };
              }
              if (metric.title === "Offers") {
                return {
                  ...metric,
                  value: (response.data.totalDomesticOffers || 0) + (response.data.totalInternationalOffers || 0),

                  
                  conversionOrders: (response.data.totalInquiriesCount || 0) > 0
                  ? ((response.data.totalDomesticOrders || 0) /
                      response.data.totalInquiriesCount * 100).toFixed(2)
                  : "0",


                  conversionInternationalOrders: (response.data.totalInternationalCount || 0) > 0
                  ? ((response.data.totalInternationalOrders || 0) /
                      response.data.totalInternationalCount * 100).toFixed(2)
                  : "0",


                  totalSampleDispatchedOffers: response.data.totalSampleDispatchedOffers,
                  totalSampleDispatchedInternationalOffers: response.data.totalSampleDispatchedInternationalOffers,
                  totalSampleDeliveredOffers: response.data.totalSampleDeliveredOffers,
                  totalSampleDeliveredInternationalOffers: response.data.totalSampleDeliveredInternationalOffers,
                  totalSampleDispatchedPendingOffers: response.data.totalSampleDispatchedPendingOffers,
                  totalSampleDispatchedPendingInternationalOffers: response.data.totalSampleDispatchedPendingInternationalOffers,
                  averageSampleAmountReceivedOffers: response.data.averageSampleAmountReceivedOffers,
                  averageSampleAmountReceivedInternationalOffers: response.data.averageSampleAmountReceivedInternationalOffers,
                  averageOfferFCD: response.data.averageOfferFCD.toFixed(2),
                  averageInternationalOfferFCD: response.data.averageInternationalOfferFCD.toFixed(2),
                  averagesampleFCD: response.data.averagesampleFCD.toFixed(2),
                  averagesampleIOFCD: response.data.averagesampleIOFCD.toFixed(2),
                  offersNetProfitLoss:response.data.offersNetProfitLoss,
                  internationalOffersNetProfitLoss:response.data.internationalOffersNetProfitLoss,
                  deliveredSampleOffersCount:response.data.deliveredSampleOffersCount,
                  deliveredSampleInternationalOffersCount : response.data.deliveredSampleInternationalOffersCount
                };
              }
              if (metric.title === "Ads") {
                return {
                  ...metric,
                  value: response.data.totalAds,
                  totalAdViews:response.data.totalAdViews,
                  totalAdReach:response.data.totalAdReach,
                  totalMessagesFromUAE:response.data.totalMessagesFromUAE,
                  totalMessagesFromIndia:response.data.totalMessagesFromIndia,
                  totalMessages:response.data.totalMessages,
                  totalAmountFromUAE:response.data.totalAmountFromUAE,
                  totalAmountFromIndia:response.data.totalAmountFromIndia,
                  totalAmountSpend: response.data.totalAmountSpend,
                  costPerMessage: response.data.costPerMessage.toFixed(2)
                };
              }
              if (metric.title === "Orders") {
                return {
                  ...metric,
                  value: response.data.totalOrders,
                  totalOrderAmount: response.data.totalOrderAmount,
                  totalInternationalOrderAmount:response.data.totalInternationalOrderAmount,
                  ordersNetProfitLoss: response.data.ordersNetProfitLoss,
                  internationalOrdersNetProfitLoss: response.data.internationalOrdersNetProfitLoss,
                  ordersAmountReceived:response.data.ordersAmountReceived,
                  ordersAmountPaid:response.data.ordersAmountPaid,
                  ordersFinalShippingValue:response.data.ordersFinalShippingValue,
                  internationalOrdersAmountReceived:response.data.internationalOrdersAmountReceived,
                  internationalOrdersAmountPaid:response.data.internationalOrdersAmountPaid,
                  internationalOrdersFinalShippingValue:response.data.internationalOrdersFinalShippingValue,
                  averageOrderValue: parseFloat(response.data.averageOrderValue).toFixed(2),
                  averageInternationalOrderValue: parseFloat(response.data.averageInternationalOrderValue),
                  averageOrderDays: response.data.averageOrderDays.toFixed(2),
                  averageInternationalOrderDays:response.data.averageInternationalOrderDays.toFixed(2),
                  pendingOrdersCount:response.data.pendingOrdersCount,
                  pendingInternationalOrdersCount : response.data.pendingInternationalOrdersCount
                };
              }
              return metric;
            })
          ); 

          setAverages({
            averageInqFCD: response.data.averageInqFCD || 0,
            averageInqTCD: response.data.averageInqTCD || 0,
          });

          setInternationalAverages({
            averageInternationalInqFCD: response.data.averageInternationalInqFCD || 0,
            averageInternationalInqTCD: response.data.averageInternationalInqTCD || 0,
          });

          setTopCategoriesData(response.data.top5CategoriesWithCounts);
          setTopInternationalCategoriesData(response.data.top5InternationalCategoriesWithCounts);

          setTopProductsData(response.data.top5SpecificProductsWithCounts);
          setTopInternationalProductsData(response.data.top5SpecificInternationalProductsWithCounts);


          setOfferInsights({
            offersWithLessThan7Days: response.data.offersWithLessThan7Days || 0,
          });

          setInternationalOfferInsights({
            internationalOffersWithLessThan7Days: response.data.internationalOffersWithLessThan7Days || 0,
          });

          setOrderInsights({
            fastOrdersDelivered : response.data.fastOrdersDelivered || 0,
            averageFinalShippingValue: (response.data.averageFinalShippingValue) || 0,
            totalWeighofAllOrders: response.data.totalWeighofAllOrders || 0,
            fastInternationalOrdersDelivered : response.data.fastInternationalOrdersDelivered || 0,
            averageInternationalFinalShippingValue : response.data.averageInternationalFinalShippingValue || 0,
            totalWeighofAllInternationalOrders : response.data.totalWeighofAllInternationalOrders || 0
          });
          
          setTopOffersData(response.data.topOffers);
          setTopInternationalOffersData(response.data.topInternationalOffers);
          setTop5SpecificProductOfferData(response.data.top5OffersSpecificProductsWithCounts);
          setTop5SpecificInternationalProductOfferData(response.data.top5InternationalOffersSpecificProductsWithCounts);

          setTop5Orders(response.data.topOrders);
          setTop5InternationalOrders(response.data.topInternationalOrders);
          setTop5Sellers(response.data.topSellers);
          setTop5InternationalSellers(response.data.topInternationalSellers);
          setTop10Products(response.data.topProducts);
          setTop10InternationalProducts(response.data.topInternationalProducts);
          setTop10Payments(response.data.topPayments);
          setTop10InternationalPayments(response.data.topInternationalPayments);
           
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



    useEffect(() => {
      if (showInternational) {
        if (selectedMetric === "Inquiries") {
          setSelectedDataType("Int");
        } else if (selectedMetric === "Offers") {
          setSelectedDataType("IntOffers");
        } else if (selectedMetric === "Ads") {
          setSelectedDataType("IntAd");
        } else if (selectedMetric === "Orders") {
          setSelectedDataType("IntOrders");
        }
      }
    }, [showInternational, selectedMetric]);
    



    return(
      <>
      
      <div className="flex justify-end mt-12 mb-4 gap-3">

        <div className="flex items-center space-x-2">
          <Label
            htmlFor="inquiries-mode"
            className={`${!showInternational ? "text-black" : "text-[#71717a]"} text-[12px] font-inter-semibold`}
          >
            Domestic
          </Label>

          <Switch
            id="inquiries-mode"
            className="cursor-pointer bg-black"
            checked={showInternational}
            onCheckedChange={() => setShowInternational((prev) => !prev)}
          />

          <Label
            htmlFor="international-inquiries-mode"
            className={`${showInternational ? "text-black" : "text-[#71717a]"} text-[12px] font-inter-semibold`}
          >
            International
          </Label>
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
            <TabsTrigger key={metric.title} value={metric.title}  className={`cursor-pointer ${selectedMetric === metric.title ? "font-inter-semibold" : ""}`}>
              {metric.title}
            </TabsTrigger>
          ))
        }
        </TabsList>
          {metrics.map((metric) => (
            <TabsContent key={metric.title} value={metric.title}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <>
              {/* inquiries */}

              {metric.title === "Inquiries" && (
                isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} height="h-[130px]" />
                  ))
                ) : (
                  <>

                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">All Inquiries</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total number of inquiries received. </p>
                        </TooltipContent>
                      </Tooltip>

                    </CardHeader>
                    <CardContent>
                      <div className="text-[32px] font-inter-bold">
                      {showInternational ? metric.internationalInquiriesTotalCount : metric.inquiriesTotalCount }
                        <p className="text-sm text-[#71717a] font-inter">
                          <span className="text-[#70ad4a]">+{metric.inquiriesThisMonthCount} from this month</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                
                  <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Active Inquiries</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="w-[250px]">
                        <p>The total number of inquiries that are currently active and in communication.</p>
                      </TooltipContent>
                    </Tooltip>

                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold">
                    {showInternational ? metric.internationalValue : metric.value }
                      <p className="text-sm text-[#71717a] font-inter">
                        <span className="text-[#70ad4a]">+{showInternational ? metric.internationalChange : metric.change} from this month</span>
                      </p>
                    </div>
                  </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Cancelled Inquiries</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The number and percentage of inquiries that are cancelled.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold">
                    {showInternational ? metric.conversionInternationalCancellations : metric.conversionCancellations } %
                    <p className="text-sm text-[#71717a] font-inter">
                        <span className="text-[#83717a]">cancellations count : {showInternational ? metric.internationalCancellationsCount : metric.domesticCancellationsCount}</span>
                      </p>
                    </div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Conversion to Offers % </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The percentage of total inquiries that have been successfully converted into offers.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                      <div className="text-[32px] font-inter-bold mb-5">
                        { showInternational ? metric.conversionInternationalOffers : metric.conversionOffers } %
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Unresponsive Inquires</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The inquiries that have not received a 3rd contact attempt. These may require follow-up or be considered cold leads. </p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.unResponsiveInternaionalInquiries : metric?.unResponsiveInquiries || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Pending Inquires</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The number of inquiries that are currently in progress and have reached the stage of a 3rd contact attempt, but are not yet converted or closed.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.pendingInternationalInquiries : metric?.pendingInquiries || 0}</div>
                    </CardContent>
                  </Card>
                  </>
                  )
                  )}

                {/* offers */}

                {metric.title === "Offers" && 
                 
                  <>
                <Card className="p-3 gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">All Offers</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="w-[250px]">
                        <p>The total number of offers received.</p>
                      </TooltipContent>
                    </Tooltip>

                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Conversion to Orders % </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The percentage of total offers that resulted in confirmed orders through an offer.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                      <div className="text-[32px] font-inter-bold mb-5">
                        { showInternational ? metric.conversionInternationalOrders : (metric.conversionOrders)} %
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Offers with Samples Sent </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Number of offers for which a sample has been dispatched. Determined by the presence of both Sample Dispatch Date and Sample Sent Address.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.totalSampleDispatchedInternationalOffers : metric.totalSampleDispatchedOffers}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Offers with Samples Delivered </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Number of offers where the sample has been delivered. Requires both Sample Delivery Date and Sample Sent Address to be present.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.totalSampleDeliveredInternationalOffers  :metric.totalSampleDeliveredOffers || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Pending Offers</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The offers where the sample dispatch process has not been initiated. Identified by missing Sample Dispatch Date.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.totalSampleDispatchedPendingInternationalOffers : metric.totalSampleDispatchedPendingOffers || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Average Sample Amount Received </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Average of all sample payments received. Only considers offers where we have received sample payments.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.averageSampleAmountReceivedInternationalOffers :metric.averageSampleAmountReceivedOffers || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Average Sample Delivery Time </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Average number of days taken from the Offer Date to the Sample Dispatch Date. This indicates the responsiveness in sending samples.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.averageInternationalOfferFCD : metric.averageOfferFCD || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Average Sample Delivery Time</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Average number of days taken for a sample to reach the recipient after being dispatched.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.averagesampleIOFCD : metric.averagesampleFCD || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Pending Offers Sample Delivered</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Offers where a sample has been delivered, but no order has been confirmed. Highlights samples that may need follow-up.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                    {showInternational ? metric.deliveredSampleInternationalOffersCount : metric?.deliveredSampleOffersCount || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="h-[130px] gap-0 justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-inter-medium">Net Profit/Loss </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The net financial gain or loss from sample transactions. </p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent>
                    <div className={`text-[32px] font-inter-bold mb-5 ${metric.offersNetProfitLoss >= '0' ? 'text-green-800' : 'text-red-500'}`}>
                    {showInternational ? metric.internationalOffersNetProfitLoss : metric.offersNetProfitLoss || 0}</div>
                    </CardContent>
                  </Card>
                  </>
                  
                }

                {/* ads */}

                {metric.title === "Ads" && 
                <>
                <Card className="p-3 gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Total Ads Published </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total number of advertisements that have been published across all platforms.</p>
                        </TooltipContent>
                      </Tooltip>  
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Total Views</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total number of times all ads have been viewed by users.</p>
                        </TooltipContent>
                      </Tooltip>  
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {metric.totalAdViews}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Total Reach</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total number of unique users who have seen the ads. Unlike views, this doesn’t count repeated views from the same user.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {metric.totalAdReach}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Total Messages Received</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total number of user messages received across all ads.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold">
                      {metric.totalMessages}
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-[#71717a] font-inter">India : {metric.totalMessagesFromIndia}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#71717a] font-inter">UAE : {metric.totalMessagesFromUAE}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Total Amount Spent</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total amount spent on advertising across all ads.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold">
                      {metric.totalAmountSpend}.00
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-[#71717a] font-inter">India : {metric.totalAmountFromIndia}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#71717a] font-inter">UAE : {metric.totalAmountFromUAE}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Cost Per Message</CardTitle>
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The average cost incurred to receive one message from ads. Helps gauge ad efficiency.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {metric.costPerMessage}
                    </div>
                  </CardContent>
                </Card>
                </>
                }

              {/* orders */}

              {metric.title === "Orders" && 
                <>
                <Card className="p-3 gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">{metric.title}</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The total number of orders received.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Total Revenue Generated (Rs.)</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Sum of all payments received for confirmed orders. Represents gross revenue.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold mb-5">
                      {showInternational ? metric.totalInternationalOrderAmount : metric.totalOrderAmount}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Net Profit/Loss (Rs.)</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>Represents the final profit or loss for all orders. Calculated as: Amount Received – Amount Paid – Final Shipping Value.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2">
                      <div className= {`text-[32px] font-inter-bold mb-5 col-span-1 ${ showInternational ?  (metric.internationalOrdersNetProfitLoss >= '0' ? 'text-green-800' : 'text-red-500')  :  (metric.ordersNetProfitLoss >= '0' ? 'text-green-800' : 'text-red-500')}`}>
                      {showInternational ? metric.internationalOrdersNetProfitLoss : metric.ordersNetProfitLoss}
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm text-[#71717a] font-inter">Amount Received: {showInternational ? metric.internationalOrdersAmountReceived :metric.ordersAmountReceived}</p>
                        <p className="text-sm text-[#71717a] font-inter">Amount Paid : {showInternational ? metric.internationalOrdersAmountPaid : metric.ordersAmountPaid}</p>
                        <p className="text-sm text-[#71717a] font-inter">Shipping Costs : {showInternational ? metric.internationalOrdersFinalShippingValue :metric.ordersFinalShippingValue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Average Order Value</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The average revenue or order value received per order.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold">
                      {showInternational ? metric.averageInternationalOrderValue :metric.averageOrderValue}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Average Order Delivery Time</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The average number of days it takes for an order to be delivered after dispatch.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold">
                      {showInternational ? metric.averageInternationalOrderDays : metric.averageOrderDays}
                    </div>
                  </CardContent>
                </Card>
                <Card className="h-[130px] gap-0 justify-center">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-inter-medium">Pending Orders</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="w-[250px]">
                          <p>The number of orders where dispatch and delivery dates are not yet recorded. Indicates orders that are confirmed but not yet dispatched.</p>
                        </TooltipContent>
                      </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[32px] font-inter-bold">
                      {showInternational ? metric.pendingInternationalOrdersCount : metric.pendingOrdersCount}
                    </div>
                  </CardContent>
                </Card>
                
                </>
                }
                

                </>
              
                </div>
            </TabsContent>
          ))}
       

      </Tabs>

        

      <Card className="pt-3">
        <CardHeader className="grid grid-cols-4 items-center">
          <CardTitle className="font-inter-semibold col-span-1 text-[18px]">Overall {selectedMetric}</CardTitle>
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
                  ) : selectedMetric === "Offers" ? (
                    <>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("DomOffers")}>Domestic</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("IntOffers")}>International</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("BothOffers")}>Both</DropdownMenuItem>
                    </>
                  ) : selectedMetric === "Ads" ? (
                    <>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("DomAd")}>Domestic</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("IntAd")}>International</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("BothAds")}>Both</DropdownMenuItem>
                    </>
                  ) : selectedMetric === "Orders" ? (
                    <>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("DomOrders")}>Domestic</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("IntOrders")}>International</DropdownMenuItem>
                      <DropdownMenuItem className="text-[11px]" onSelect={() => setSelectedDataType("BothOrders")}>Both</DropdownMenuItem>
                    </>
                  ) : null}

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


      

      {(selectedMetric === "Inquiries") && (
        <>
        <div className="grid grid-cols-2 mt-6 gap-6">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} height="h-[415px]" />
            ))
          ) : (
          <>
          <SocialPieChart showInternational={showInternational} />
          <LocationBarChart showInternational = {showInternational} />
          </>
          )}
        </div>
    


      {/*  Key Insights */}
      <Card className="mt-6 py-6">
          <CardHeader>
            <CardTitle className="font-inter-semibold text-2xl">Key Insights</CardTitle>
            <CardDescription className="text-sm text-[#71717a] font-inter">Important metrics and observations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
                {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonCard key={i} height="h-[35px]" />
                ))
              ) : (
              <>
              <li>Average Inquiry Response Time : {showInternational ? internationalAverages.averageInternationalInqFCD : averages.averageInqFCD}  </li>
              <li>Average Days Inquiry Pending : {showInternational ? internationalAverages.averageInternationalInqTCD : averages.averageInqTCD}  </li>
              </>
              )}
            </ul>
          </CardContent>
        </Card>


        <div className="grid grid-cols-2 my-6 gap-6">
        {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} height="h-[327px]" />
            ))
          ) : (
          <>
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Categories </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common categories with inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInternational ? 
                (topInternationalCategoriesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.category}</div>
                    <div className="font-semibold">{item.inquiries}</div>
                  </div>
                )))
                :(topCategoriesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.category}</div>
                    <div className="font-semibold">{item.inquiries}</div>
                  </div>
                )))}
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
                {showInternational ? 
                (topInternationalProductsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.product}</div>
                    <div className="font-semibold">{item.count}</div>
                  </div>
                )))
                :
                (topProductsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.product}</div>
                    <div className="font-semibold">{item.count}</div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>
        </>
      )}

      {(selectedMetric === "Offers") && (
        <>
          <div className="grid grid-cols-2 mt-6 gap-6">

          <OfferPieChart showInternational={showInternational} />

        </div>
         {/*  Key Insights */}
        <Card className="mt-6 py-6">
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl">Key Insights</CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Important metrics and observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Fast Samples Delivered  : {showInternational ? internationalOfferInsights.internationalOffersWithLessThan7Days : offerInsights.offersWithLessThan7Days}  </li>
              </ul>
            </CardContent>
          </Card>


        <div className="grid grid-cols-2 my-6 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Offers </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common offers with sample amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInternational ? (topInternationalOffersData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">

                    <div>Offer No.{item.offer_number}</div>
                    <div className="font-semibold">{item.received_sample_amount}</div>
                  </div>
                ))) : (topOffersData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">

                    <div>Offer No.{item.offer_number}</div>
                    <div className="font-semibold">{item.received_sample_amount}</div>
                  </div> ))
                  )
                  }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Products </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common offers with sample amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInternational 
                ? (top5SpecificProductInternationalOfferData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">

                    <div>{item.product}</div>
                    <div className="font-semibold">{item.count}</div>
                  </div>
                ))) 
                :
                (top5SpecificProductOfferData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">

                    <div>{item.product}</div>
                    <div className="font-semibold">{item.count}</div>
                  </div>
                )))
              }
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {(selectedMetric === "Orders") && (
        <>
          <div className="grid grid-cols-2 mt-6 gap-6">
            <OrderStatusPieChart showInternational={showInternational} />
            <LogisticsStatusPieChart showInternational={showInternational} />
          </div>
            {/*  Key Insights */}
            <Card className="mt-6 py-6">
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl">Key Insights</CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Important metrics and observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Fast Orders Delivered : {showInternational ? orderInsights.fastInternationalOrdersDelivered : orderInsights.fastOrdersDelivered}  </li>
                <li>Average Logistics Cost : {showInternational ? orderInsights.averageInternationalFinalShippingValue : orderInsights.averageFinalShippingValue}  </li>
                <li>Total Order Size Fulfilled : {showInternational ? orderInsights.totalWeighofAllInternationalOrders : orderInsights.totalWeighofAllOrders}  </li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 my-6 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Orders </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common orders with amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInternational 
                ? 
                (top5InternationalOrders.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>Order Number : {item.order_number}</div>
                    <div className="font-semibold">{item.amount_received}</div>
                  </div>
                )))
                :
                (top5Orders.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>Order Number : {item.order_number}</div>
                    <div className="font-semibold">{item.amount_received}</div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 5 Sellers </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common orders with amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                { showInternational
                ?
                (top5InternationalSeller.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.seller_name}</div>
                    <div className="font-semibold">{item.total_orders}</div>
                  </div>
                )))
                : 
                (top5Seller.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.seller_name}</div>
                    <div className="font-semibold">{item.total_orders}</div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 10 Products </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common orders with amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInternational
                ?
                (top10InternationalProducts.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.product_name}</div>
                    <div className="font-semibold">{item.product_count}</div>
                  </div>
                )))
                :
                (top10Products.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.product_name}</div>
                    <div className="font-semibold">{item.product_count}</div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-inter-semibold text-2xl pt-4">Top 10 Buyers by Revenue </CardTitle>
              <CardDescription className="text-sm text-[#71717a] font-inter">Most common orders with amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInternational
                ?
                (top10InternationalPayments.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.name}</div>
                    <div className="font-semibold">{item.amount_received}</div>
                  </div>
                )))
                :
                (top10Payments.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>{item.name}</div>
                    <div className="font-semibold">{item.amount_received}</div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
          </div>
        </>
      )}

      {(selectedMetric === "Ads") && (
          <div className="grid grid-cols-2 mt-6 gap-6">
            <AdsPieChart showInternational={showInternational} />
          </div>
      )}
    </div>

      </>       

    )
}

export default AnalyticsDashboard;