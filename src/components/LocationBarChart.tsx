"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card,CardHeader, CardContent, CardDescription} from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import React, { useEffect, useState } from "react"
import axiosInstance from "@/lib/axios"


type SocialPieChartProps = {
  showInternational: boolean;
};


// const chartData = [
//   { month: "January", desktop: 186 },
//   { month: "February", desktop: 305 },
//   { month: "March", desktop: 237 },
//   { month: "April", desktop: 73 },
//   { month: "May", desktop: 209 },
//   { month: "June", desktop: 214 },
// ]

interface LocationData {
    location: string;
    count: number;
    fill: string;

  }

  interface TopLocation {
    location: string;
    count: number;
  }
  
  

type ChartDatum = {
    location: string;
    count: number;
    fill: string;
  };

const chartConfig = {
    count: { label: "Inquiries" },
} satisfies ChartConfig

const LocationBarChart:React.FC<SocialPieChartProps> = ({showInternational}) => {
    const [chartData, setChartData] = useState<ChartDatum[]>([]);

    useEffect(() => {
        const fetchTopLocations = async () => {
          const token = localStorage.getItem("authToken");
          if (!token) {
            console.log("User is not authenticated.");
            return;
          }
      
          try {
            const response = await axiosInstance.get('/refresh-all', {
              headers: { Authorization: `Bearer ${token}` },
            });


            const topLocations = showInternational
            ? response.data?.data?.topInternationalLocations
            : (response.data?.data?.topLocations ?? []);

            console.log(showInternational)

      
            const formatted: LocationData[] = topLocations.map((loc: TopLocation) => ({
              location: loc.location,
              count: loc.count,
            }));
      
            setChartData(formatted);
          } catch (error) {
            console.error('Error fetching inquiries:', error);
          }
        };
      
        fetchTopLocations();
      }, [showInternational]);
         
    
      
  return (
    <Card>
      <CardHeader className="font-inter-semibold text-2xl pt-4">Location Demographics
        <CardDescription className="text-sm text-[#71717a] font-inter">Inquiries Through Locations</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="location"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="#000" radius={8} barSize={60} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default LocationBarChart;
