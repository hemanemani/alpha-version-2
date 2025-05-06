"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts"
import ChartContainer from "@/components/ui/chart"
import { DateRange } from "react-day-picker"
import { format, parseISO } from "date-fns"
import axiosInstance from "@/lib/axios"
import { useTheme } from "next-themes"


interface AnalyticsChartProps {
    selectedMetric: string
    selectedTimeRange: string
    selectedDataType: string
    dateRange: DateRange | undefined
  }

  interface ChartData {
    date: string;
    Dom: number;
    Int: number;
    DomOffers:number;
    IntOffers:number;
    DomAd:number;
    IntAd:number;
    DomOrders:number;
    IntOrders:number;
  }
  type ApiResponseItem = {
    date: string;
    Dom?: number;
    Int?: number;
    DomOffers?: number;
    IntOffers?: number;
    DomAd?:number;
    IntAd?:number;
    DomOrders?:number;
    IntOrders?:number;
  };
  
  
  

const AnalyticsChart = ({selectedMetric,selectedTimeRange,selectedDataType,dateRange}:AnalyticsChartProps)=>{

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { resolvedTheme } = useTheme()

  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.log("User is not authenticated.");
          return;
        }

        const endpoint = selectedMetric === "Offers"
        ? "/analytics/offers"
        : selectedMetric === "Ads"
        ? "/analytics/ads"
        : selectedMetric === "Orders"
        ? "/analytics/orders"
        : "/analytics/inquiries";
      

        const response = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            timeRange: selectedTimeRange,
            from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null,
            to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null,
          },
        });

        if (response.data) {
          const formattedData = response.data.map((item: ApiResponseItem) => ({
            date: format(parseISO(item.date), "MMM dd"),
            Dom: selectedMetric === "Inquiries" ? item.Dom ?? 0 : undefined,
            Int: selectedMetric === "Inquiries" ? item.Int ?? 0 : undefined,
            DomOffers: selectedMetric === "Offers" ? item.DomOffers ?? 0 : undefined,
            IntOffers: selectedMetric === "Offers" ? item.IntOffers ?? 0 : undefined,
            DomAd: selectedMetric === "Ads" ? item.DomAd ?? 0 : undefined,
            IntAd: selectedMetric === "Ads" ? item.IntAd ?? 0 : undefined,
            DomOrders: selectedMetric === "Orders" ? item.DomOrders ?? 0 : undefined,
            IntOrders: selectedMetric === "Orders" ? item.IntOrders ?? 0 : undefined,

          }));
          console.log(formattedData)
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [selectedTimeRange, dateRange,selectedMetric]);

    
      const config = {
        Dom: {
          label: "Domestic",
          color: resolvedTheme === "dark" ? "hsl(215, 100%, 60%)" : "hsl(215, 100%, 50%)",
        },
        Int: {
          label: "International",
          color: resolvedTheme === "dark" ? "hsl(145, 100%, 60%)" : "hsl(145, 100%, 50%)",
        },
        DomOffers: {
          label: "Domestic",
          color: resolvedTheme === "dark" ? "hsl(215, 100%, 60%)" : "hsl(215, 100%, 50%)",
        },
        IntOffers: {
          label: "International",
          color: resolvedTheme === "dark" ? "hsl(145, 100%, 60%)" : "hsl(145, 100%, 50%)",
        },
        DomAd: {
          label: "Domestic",
          color: resolvedTheme === "dark" ? "hsl(215, 100%, 60%)" : "hsl(215, 100%, 50%)",
        },
        IntAd: {
          label: "International",
          color: resolvedTheme === "dark" ? "hsl(145, 100%, 60%)" : "hsl(145, 100%, 50%)",
        },
        DomOrders: {
          label: "Domestic",
          color: resolvedTheme === "dark" ? "hsl(215, 100%, 60%)" : "hsl(215, 100%, 50%)",
        },
        IntOrders: {
          label: "International",
          color: resolvedTheme === "dark" ? "hsl(145, 100%, 60%)" : "hsl(145, 100%, 50%)",
        },
      }
    
      return (
        <ChartContainer config={config} >
          {chartData.every((data) => 
            (data.Dom === 0 || data.Dom === undefined) && 
            (data.Int === 0 || data.Int === undefined) &&
            (data.DomOffers === 0 || data.DomOffers === undefined) && 
            (data.IntOffers === 0 || data.IntOffers === undefined) &&
            (data.DomAd === 0 || data.DomAd === undefined) && 
            (data.IntAd === 0 || data.IntAd === undefined) &&
            (data.DomOrders === 0 || data.DomOrders === undefined) && 
            (data.IntOrders === 0 || data.IntOrders === undefined)
          )
          
          ? (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                <p className="text-[14px]">No Data Available</p>
              </div>
            ) : (

            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                interval={selectedTimeRange === "Today" ? 3 : "preserveEnd"}
                tickFormatter={(value) => (selectedTimeRange === "Today" ? value : format(new Date(value), "MMM dd"))}
              />
              <YAxis />
              <Tooltip labelFormatter={(label) => (selectedTimeRange === "Today" ? `Time: ${label}` : `Date: ${label}`)} />
              {(selectedDataType === "Both" || selectedDataType === "Dom") && (
                <Area type="monotone"
                 dataKey="Dom"
                 name={config.Dom.label}
                 stroke={config.Dom.color}
                 fill={config.Dom.color}
                 fillOpacity={0.2} />
              )}
              {(selectedDataType === "Both" || selectedDataType === "Int") && (
                <Area type="monotone"
                 dataKey="Int"
                 name={config.Int.label}
                 stroke={config.Int.color}
                 fill={config.Int.color}
                 fillOpacity={0.2} />
              )}
              {(selectedMetric === "Offers" && (selectedDataType === "BothOffers" || selectedDataType === "DomOffers")) && (
                <Area 
                  type="monotone" 
                  dataKey="DomOffers"
                  name={config.DomOffers.label}
                  stroke={config.DomOffers.color} 
                  fill={config.DomOffers.color} 
                  fillOpacity={0.2} 
                />
              )}
              {(selectedMetric === "Offers" && (selectedDataType === "BothOffers" || selectedDataType === "IntOffers")) && (
                <Area 
                  type="monotone" 
                  dataKey="IntOffers" 
                  name={config.IntOffers.label}
                  stroke={config.IntOffers.color} 
                  fill={config.IntOffers.color} 
                  fillOpacity={0.2} 
                />
              )}
              {(selectedMetric === "Ads" && (selectedDataType === "BothAds" || selectedDataType === "DomAd")) && (
                <Area 
                  type="monotone" 
                  dataKey="DomAd"
                  name={config.DomAd.label}
                  stroke={config.DomAd.color} 
                  fill={config.DomAd.color} 
                  fillOpacity={0.2} 
                />
              )}
              {(selectedMetric === "Ads" && (selectedDataType === "BothAds" || selectedDataType === "IntAd")) && (
                <Area 
                  type="monotone" 
                  dataKey="IntAd" 
                  name={config.IntAd.label}
                  stroke={config.IntAd.color} 
                  fill={config.IntAd.color} 
                  fillOpacity={0.2} 
                />
              )}
              {(selectedMetric === "Orders" && (selectedDataType === "BothOrders" || selectedDataType === "DomOrders")) && (
                <Area 
                  type="monotone" 
                  dataKey="DomOrders"
                  name={config.DomOrders.label}
                  stroke={config.DomOrders.color} 
                  fill={config.DomOrders.color} 
                  fillOpacity={0.2} 
                />
              )}
              {(selectedMetric === "Orders" && (selectedDataType === "BothOrders" || selectedDataType === "IntOrders")) && (
                <Area 
                  type="monotone" 
                  dataKey="IntAd" 
                  name={config.IntOrders.label}
                  stroke={config.IntOrders.color} 
                  fill={config.IntOrders.color} 
                  fillOpacity={0.2} 
                />
              )}

            </AreaChart>
              )}

        </ChartContainer>    
        
    )}
export default AnalyticsChart;