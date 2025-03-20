"use client"

import { useEffect, useState } from "react"
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"

interface LocationData {
  location: string;
  count: number;
}

interface MetricData {
  name: string;
  count: number;
  offers: number;
  cancellations: number;
  dateRanges: {
    yesterday?: number;
    from: string;
    to: string
  };
  offerDateRanges: { 
    yesterday?: number;
    from: string;
    to: string
   };
  cancelDateRanges: { 
    yesterday?: number;
    from: string;
    to: string };
}

interface DashboardData {
  inquiry: MetricData;
  interInquiry: MetricData;
  topLocations: LocationData[];
}


export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [selectedDate, setSelectedDate] = useState(2);

  const [dashBoardData, setdashBoardData] = useState<DashboardData>(
    {
      inquiry: {
        name: 'inquiry',
        count: 0,
        offers: 0,
        cancellations: 0,
        dateRanges: {
          yesterday:0,
          from: '',
           to: ''
        },
        offerDateRanges: {
          yesterday:0,
          from: '',
           to: ''
        },
        cancelDateRanges: {
          yesterday:0,
          from: '',
           to: ''
        },
      },
      interInquiry: {
        name: 'interInquiry',
        count: 0,
        offers: 0,
        cancellations: 0,
        dateRanges: {
          yesterday:0,
          from: '',
           to: ''
        },
        offerDateRanges: {
          yesterday:0,
          from: '',
           to: ''
        },
        cancelDateRanges: {
          yesterday:0,
          from: '',
           to: ''
        },
      },
    
      topLocations: [],
    }
  );

  const fetchDashboardData = async()=>{
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      return;
    }

    try {
      const response = await axiosInstance.get("/refresh-all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data) {
        setdashBoardData(response.data.data)
      } else {
        console.error("Failed to fetch inquiries", response.status);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  }

  useEffect(() => {
      fetchDashboardData();
    }, [refresh]);

  return (
    <>
    <div className="flex justify-end mt-12 mb-4">
      <button className="flex items-center gap-2 text-sm" onClick={() => setRefresh((prev) => !prev)}>
        <RefreshCw className="h-3 w-3" /><span className="text-[12px] font-bold cursor-pointer">Refresh all</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 col-span-2 h-[150px]">
        {/* Metrics Cards */}
        <Card className="h-[240px]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg text-muted-foreground">Inquiries</h3>
                <p className="text-4xl font-semibold">{(dashBoardData?.inquiry?.count || 0) + (dashBoardData?.interInquiry?.count || 0)
                }</p>
              </div>
              <span className="text-green-500 text-sm">↑ {dashBoardData?.inquiry?.dateRanges?.yesterday || 0
              }
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domestic</p>
                <p className="text-xl font-medium">{dashBoardData?.inquiry?.count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">International</p>
                <p className="text-xl font-medium">{dashBoardData?.interInquiry?.count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[240px]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg text-muted-foreground">Offers</h3>
                <p className="text-4xl font-semibold">{ 
                  (dashBoardData?.inquiry?.offers || 0) + (dashBoardData?.interInquiry?.offers || 0)
                }</p>
              </div>
              <span className="text-green-500 text-sm">↑ {dashBoardData?.inquiry?.offerDateRanges?.yesterday || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domestic</p>
                <p className="text-xl font-medium">{dashBoardData?.inquiry?.offers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">International</p>
                <p className="text-xl font-medium">{dashBoardData?.interInquiry?.offers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-[240px]">
          <CardContent className="p-6">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg text-muted-foreground">Canceled Inquiries</h3>
                <p className="text-4xl font-semibold">20</p>
              </div>
              <span className="text-red-500 text-sm">↓ 3</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domestic</p>
                <p className="text-xl font-medium">15</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">International</p>
                <p className="text-xl font-medium">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[240px]">
          <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg text-muted-foreground">Orders Completed</h3>
                <p className="text-4xl font-semibold">{ 
                  (dashBoardData?.inquiry?.cancellations || 0) + (dashBoardData?.interInquiry?.cancellations || 0)
                }</p>
              </div>
              <span className="text-green-500 text-sm">↑ {dashBoardData?.inquiry?.cancelDateRanges?.yesterday || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domestic</p>
                <p className="text-xl font-medium">{dashBoardData?.inquiry?.cancellations || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">International</p>
                <p className="text-xl font-medium">{dashBoardData?.interInquiry?.cancellations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6 col-span-1">
        {/* Calendar Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">
                January,<span className="text-muted-foreground">2025</span>
              </h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm mb-2">
              {["Mo", "Tu", "We", "Fr", "Sa", "Th", "Su"].map((day) => (
                <div key={day} className="text-center text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
              {Array.from({ length: 28 }, (_, i) => {
                const day = i + 1
                return (
                  <button
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-full
                      ${selectedDate === day ? "bg-black text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Growth Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg">Inquiry Growth</h3>
              <select className="text-sm bg-transparent border px-2 py-1 rounded">
                <option>All Time</option>
              </select>
            </div>
            <div className="space-y-4">
              {dashBoardData?.topLocations.map((item) => (
                <div key={item.location} className="flex items-center justify-between">
                  <span className="text-sm">{item.location}</span>
                  <span className="font-medium">{item.count}</span>
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

