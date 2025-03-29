"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts"
import ChartContainer from "@/components/ui/chart"
import { DateRange } from "react-day-picker"
import { format, parseISO } from "date-fns"
import axiosInstance from "@/lib/axios"


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
  }
  type ApiResponseItem = {
    date: string;
    Dom?: number;
    Int?: number;
    DomOffers?: number;
    IntOffers?: number;
  };
  
  
  

const AnalyticsChart = ({selectedMetric,selectedTimeRange,selectedDataType,dateRange}:AnalyticsChartProps)=>{

  const [chartData, setChartData] = useState<ChartData[]>([]);

  
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
          }));
          
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
          color: "hsl(var(--chart-1))",
        },
        Int: {
          label: "International",
          color: "hsl(var(--chart-2))",
        },
        DomOffers: {
          label: "Offers",
          color: "hsl(var(--chart-2))",
        },
        IntOffers: {
          label: "International Offers",
          color: "hsl(var(--chart-2))",
        },

      }
    
      return (
        <ChartContainer config={config} >
          {selectedTimeRange === "Today" && chartData.every((data) => data.Dom === 0 && data.Int === 0) ? (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                <p className="text-[14px]">No inquiries today</p>
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
                <Area type="monotone" dataKey="Dom" stroke={config.Dom.color} fill={config.Dom.color} fillOpacity={0.2} />
              )}
              {(selectedDataType === "Both" || selectedDataType === "Int") && (
                <Area type="monotone" dataKey="Int" stroke={config.Int.color} fill={config.Int.color} fillOpacity={0.2} />
              )}
              {(selectedMetric === "Offers" && (selectedDataType === "BothOffers" || selectedDataType === "DomOffers")) && (
                <Area 
                  type="monotone" 
                  dataKey="DomOffers" 
                  stroke={config.DomOffers.color} 
                  fill={config.DomOffers.color} 
                  fillOpacity={0.2} 
                />
              )}
              {(selectedMetric === "Offers" && (selectedDataType === "BothOffers" || selectedDataType === "IntOffers")) && (
                <Area 
                  type="monotone" 
                  dataKey="IntOffers" 
                  stroke={config.IntOffers.color} 
                  fill={config.IntOffers.color} 
                  fillOpacity={0.2} 
                />
              )}

            </AreaChart>
              )}

        </ChartContainer>    
        
    )}
export default AnalyticsChart;