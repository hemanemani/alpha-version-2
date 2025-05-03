"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect,useState } from "react"
import axiosInstance from "@/lib/axios"




interface adsCounts {
  platform: string;
  total: number;
}

interface OfferApiResponse {
  combinedAds: adsCounts[];
}

  type ChartDatum = {
    browser: string;
    visitors: number;
    fill: string;
  };


const chartConfig = {
  visitors: {
    label: "Ads",
  }
} satisfies ChartConfig




export function AdsPieChart() {
  

  const [chartData, setChartData] = useState<ChartDatum[]>([]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((total, item) => total + item.visitors, 0);
  }, [chartData]);
  

  useEffect(() => {
    const fetchOffers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }

      try {
        const response = await axiosInstance.get<OfferApiResponse>('/all-inquiries', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const counts = response.data.combinedAds;

        const colorMap: Record<string, string> = {
          Meta: "#F59E0B",
          Instagram: "#10B981",
          Facebook: "#3b5998"
        };
  
        const chartData: ChartDatum[] = counts.map((item) => ({
          browser: item.platform,
          visitors: item.total,
          fill: colorMap[item.platform] || "#6B7280"
        }));
  

        setChartData(chartData);

      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };

    fetchOffers();
  }, []);




  return (
    <Card className="flex flex-col">
      <CardHeader className="font-inter-semibold text-2xl pt-4">Ad Demographics
        <CardDescription className="text-sm text-[#71717a] font-inter">Ads Through Meta Instagram Facebook</CardDescription>
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
