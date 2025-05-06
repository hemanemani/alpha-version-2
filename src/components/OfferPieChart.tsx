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


interface SampleStatusCounts {
  notDispatched: number;
  dispatchedOnly: number;
  bothFilled: number;
}

interface OfferApiResponse {
  sampleStatusCounts: SampleStatusCounts;
}

  type ChartDatum = {
    browser: string;
    visitors: number;
    fill: string;
  };


const chartConfig = {
  visitors: {
    label: "Offers",
  }
} satisfies ChartConfig




const OfferPieChart:React.FC<SocialPieChartProps> = ({showInternational}) => {
  

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

        const url = showInternational
        ? "/all-international-inquiries"
        : "/all-inquiries";

      const response = await axiosInstance.get<OfferApiResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
        const counts = response.data.sampleStatusCounts;

        const chartData: ChartDatum[] = [
          { browser: "Sample not Sent", visitors: counts.notDispatched || 0, fill: "#EF4444" },
          { browser: "Sample Sent", visitors: counts.dispatchedOnly || 0, fill: "#F59E0B" },
          { browser: "Sample Delivered", visitors: counts.bothFilled || 0, fill: "#10B981" },
        ];

        setChartData(chartData);

      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };

    fetchOffers();
  }, [showInternational]);




  return (
    <Card className="flex flex-col">
      <CardHeader className="font-inter-semibold text-2xl pt-4">Offer Demographics
        <CardDescription className="text-sm text-[#71717a] font-inter">Offer Through Sample Dispatch and Delivery</CardDescription>
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

export default OfferPieChart;
