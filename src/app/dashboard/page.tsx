"use client"

import React, { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { Calendar } from "@/components/ui/calendar"
import AlertMessages from "@/components/AlertMessages";


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
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);


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

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      setAlertMessage("Login successful! Redirecting to dashboard...");
      setIsSuccess(true);
  
      setTimeout(() => {
        setAlertMessage("");
        setIsSuccess(false);
        localStorage.removeItem("isLoggedIn");
      }, 2000);
    }
  }, []);
  

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

    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 mx-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 col-span-2 h-[200px]">
        {/* Metrics Cards */}
        <Card className="py-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[22px] font-[500] text-[#7f7f7f]">Inquiries</h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold">{(dashBoardData?.inquiry?.count || 0) + (dashBoardData?.interInquiry?.count || 0)
                }</p>
                <span
                  className={`text-sm font-semibold ${
                    (dashBoardData?.inquiry?.dateRanges?.yesterday ?? 0) > 0
                      ? "text-[#70ad4a]"
                      : "text-[#ff010b]"
                  }`}
                >
                  {(dashBoardData?.inquiry?.dateRanges?.yesterday ?? 0) > 0 ? "↑" : "↓"}{" "}
                  {dashBoardData?.inquiry?.dateRanges?.yesterday ?? 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                <p className="text-[16px] font-[600] text-center">{dashBoardData?.inquiry?.count || 0}</p>
              </div>
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                <p className="text-[16px] font-[600] text-center">{dashBoardData?.interInquiry?.count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[22px] font-[500] text-[#7f7f7f]">Offers</h3>
              </div>
              <div className="text-center">
                  <p className="text-4xl font-bold">{ 
                    (dashBoardData?.inquiry?.offers || 0) + (dashBoardData?.interInquiry?.offers || 0)
                  }</p>
                  <span
                  className={`text-sm font-semibold ${
                    (dashBoardData?.inquiry?.offerDateRanges?.yesterday ?? 0) > 0
                      ? "text-[#70ad4a]"
                      : "text-[#ff010b]"
                  }`}
                >
                  {(dashBoardData?.inquiry?.offerDateRanges?.yesterday ?? 0) > 0 ? "↑" : "↓"}{" "}
                  {dashBoardData?.inquiry?.offerDateRanges?.yesterday ?? 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                <p className="text-[16px] font-[600] text-center">{dashBoardData?.inquiry?.offers || 0}</p>
              </div>
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                <p className="text-[16px] font-[600] text-center">{dashBoardData?.interInquiry?.offers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="py-2">
          <CardContent className="p-6">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[22px] font-[500] text-[#7f7f7f]">  <span className="block">Orders</span> Completed</h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold">20</p>
              <span className="text-[#70ad4a] text-sm font-semibold">↑ 3</span>

              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                <p className="text-[16px] font-[600] text-center">15</p>
              </div>
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                <p className="text-[16px] font-[600] text-center">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[22px] font-[500] text-[#7f7f7f]">  <span className="block">Cancelled</span> Inquiries
                </h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold">{ 
                    (dashBoardData?.inquiry?.cancellations || 0) + (dashBoardData?.interInquiry?.cancellations || 0)
                }</p>
                <span
                  className={`text-sm font-semibold ${
                    (dashBoardData?.inquiry?.cancelDateRanges?.yesterday ?? 0) > 0
                      ? "text-[#70ad4a]"
                      : "text-[#ff010b]"
                  }`}
                >
                  {(dashBoardData?.inquiry?.cancelDateRanges?.yesterday ?? 0) > 0 ? "↑" : "↓"}{" "}
                  {dashBoardData?.inquiry?.cancelDateRanges?.yesterday ?? 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                <p className="text-[16px] font-[600] text-center">{dashBoardData?.inquiry?.cancellations || 0}</p>
              </div>
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                <p className="text-[16px] font-[600] text-center">{dashBoardData?.interInquiry?.cancellations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2">
          {alertMessage && (
              <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
          )}
        </div>

      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6 col-span-1">
        {/* Calendar Card */}
            <div className="flex justify-center shadow bg-white rounded-2xl border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="text-8xl"
              />

            </div>
          

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

