import React, { useEffect, useState } from "react"
import {BarChart,Bar,XAxis, ResponsiveContainer} from "recharts"
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { BarProps } from 'recharts';


interface ChartDatum {
  location: string
  count: number
}



interface SocialPieChartProps {
  showInternational: boolean
}

interface CustomBarProps extends BarProps {
  index: number;
  payload: ChartDatum;
}


const LocationBarChart: React.FC<SocialPieChartProps> = ({ showInternational }) => {
  const [chartData, setChartData] = useState<ChartDatum[]>([])
  const [animationProgress, setAnimationProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchTopLocations = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.log("User is not authenticated.")
        return
      }

      try {
        const response = await axiosInstance.get("/refresh-all", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const topLocations = showInternational
          ? response.data?.data?.topInternationalLocations
          : response.data?.data?.topLocations ?? []

        const formatted: ChartDatum[] = topLocations.map((loc: ChartDatum) => ({
          location: loc.location,
          count: loc.count,
        }))

        setChartData(formatted)
      } catch (error) {
        console.error("Error fetching inquiries:", error)
      }
    }

    fetchTopLocations()
  }, [showInternational])

  useEffect(() => {
    let raf: number
    const start = performance.now()

    const animate = (time: number) => {
      const progress = Math.min((time - start) / 1000, 1) // 1 second animation
      setAnimationProgress(progress)
      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  const CustomBar: React.FC<CustomBarProps> = ({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    index,
    payload,
  }) => {
    const numericX = typeof x === 'number' ? x : parseFloat(x);
    const numericY = typeof y === 'number' ? y : parseFloat(y);
    const numericWidth = typeof width === 'number' ? width : parseFloat(width);
    const numericHeight = typeof height === 'number' ? height : parseFloat(height);
  
    const count = payload.count;
    const animatedHeight = numericHeight * animationProgress;
    const isActive = activeIndex === index;
  
    return (
      <g>
        <defs>
          <linearGradient id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
  
        <rect
          x={numericX}
          y={numericY + (numericHeight - animatedHeight)}
          width={numericWidth}
          height={animatedHeight}
          fill={isActive ? `url(#barGradient-${index})` : '#2563eb'}
          rx={8}
          ry={8}
          filter={isActive ? `url(#glow-${index})` : 'none'}
          className="cursor-pointer transition-all duration-300 ease-in-out"
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        />
  
        {isActive && (
          <foreignObject
            x={numericX}
            y={numericY - 50}
            width={numericWidth}
            height={50}
            style={{ overflow: 'visible' }}
          >
            <div
              className="tooltip-animation border rounded-md shadow-lg p-2 text-center absolute left-1/2 transform -translate-x-1/2"
              style={{
                zIndex: 50,
                width: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2563eb]"></div>
                <span className="text-[12px] font-inter">Inquiries</span>
                <span className="text-[12px] font-inter-bold">{count}</span>
              </div>
              <div className="absolute left-1/2 bottom-0 w-0 h-0 -mb-2 border-8 border-transparent transform -translate-x-1/2"></div>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };
  
  
  
  return (
    <>
    <Card>
      <CardHeader className="font-inter-semibold text-2xl pt-4">
        Location Demographics
        <CardDescription className="text-sm text-[#71717a] font-inter">
          Inquiries Through Locations
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-full px-0">
        <div className="animate-fade-in w-full" style={{ minHeight: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 50, right: 30, left: 30, bottom: 30 }}
              barCategoryGap="20%"
            >
              <XAxis
                dataKey="location"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                interval={0}
                tick={{ fill: "#6a7282", opacity: animationProgress}}
                tickFormatter={(value) => value}
                className="font-inter text-[12px]"
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                barSize={60}
                shape={(props: BarProps) => <CustomBar {...props as CustomBarProps} />}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    {/* <Card>
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
    </Card> */}
  </>
  )
}

export default LocationBarChart
