"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect,useState } from "react"
import axiosInstance from "@/lib/axios"

type SocialPieChartProps = {
  showInternational: boolean;
};

interface orderLogisticsCounts {
  ship_rocket: number;
  seller_fulfilled: number;
  total: number;
}

interface OrderApiResponse {
  logisticsData: orderLogisticsCounts;
}

  type ChartDatum = {
    fill: string;
    logistics: string;
    count: number;
  
  };


const chartConfig = {
  visitors: {
    label: "Logistics",
  }
} satisfies ChartConfig




const LogisticsStatusPieChart:React.FC<SocialPieChartProps> = ({showInternational}) => {
  

  const [chartData, setChartData] = useState<ChartDatum[]>([]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((total, item) => total + item.count, 0);
  }, [chartData]);
  
  

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }

      try {

        const url = showInternational
        ? "/all-international-inquiries"
        : "/all-inquiries";

      const response = await axiosInstance.get<OrderApiResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

        const data = response.data.logisticsData;

        const colorMap: Record<string, string> = {
          Delivered: "#4ade80",   // Green
          Dispatched: "#fbbf24",  // Yellow
          Pending: "#f87171"      // Red
        };
    
        const chartData: ChartDatum[] = [
          { logistics: "Ship Rocket", count: data.ship_rocket, fill: colorMap.Delivered },
          { logistics: "Seller Fulfilled", count: data.seller_fulfilled, fill: colorMap.Dispatched },
        ];
        
        setChartData(chartData);
        

      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };

    fetchOrders();
  }, [showInternational]);




  return (
    <Card className="flex flex-col">
      <CardHeader className="font-inter-semibold text-2xl pt-4">Order Status 
        <CardDescription className="text-sm text-[#71717a] font-inter">Ads Through Meta Instagram Facebook</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="logistics" innerRadius={60} strokeWidth={5} isAnimationActive={true}animationBegin={0} animationDuration={800} >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Orders
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  )
}

export default LogisticsStatusPieChart;