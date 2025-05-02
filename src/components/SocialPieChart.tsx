"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect,useState } from "react"
import axiosInstance from "@/lib/axios"


interface Inquiry{
    id: number;
    inquiry_through: string;
  }

  type ChartDatum = {
    browser: string;
    visitors: number;
    fill: string;
  };


const chartConfig = {
  visitors: {
    label: "Inquiries",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig




export function SocialPieChart() {
  

  const [chartData, setChartData] = useState<ChartDatum[]>([]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((total, item) => total + item.visitors, 0);
  }, [chartData]);
  

  useEffect(() => {
    const fetchInquiries = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }

      try {
        const response = await axiosInstance.get<Inquiry[]>('/all-inquiries', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          // Count how many inquiries per channel
          const counts: Record<string, number> = {
            WhatsApp: 0,
            Facebook: 0,
            Instagram: 0,
            Others: 0
          };

          response.data.forEach((item) => {
            const channel = item.inquiry_through?.toLowerCase();
            if (channel === "whatsapp") counts.WhatsApp += 1;
            else if (channel === "facebook") counts.Facebook += 1;
            else if (channel === "instagram") counts.Instagram += 1;
            
          });

          // Create chart data array
          const chartData: ChartDatum[] = [
            { browser: "WhatsApp", visitors: counts.WhatsApp, fill: "#25D366" },
            { browser: "Facebook", visitors: counts.Facebook, fill: "#1877F2" },
            { browser: "Instagram", visitors: counts.Instagram, fill: "#E1306C" },
          ];

          setChartData(chartData);
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };

    fetchInquiries();
  }, []);




  return (
    <Card className="flex flex-col">
      <CardHeader className="font-inter-semibold text-2xl pt-4">Inquiry Demographics
        <CardDescription className="text-sm text-[#71717a] font-inter">Inquiries Through Social Media</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5} isAnimationActive={true}animationBegin={0} animationDuration={800} >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Inquiries
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
