"use client"

import React, { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { Calendar } from "@/components/ui/calendar"
import AlertMessages from "@/components/AlertMessages";
import { SkeletonCard } from "@/components/SkeletonCard"

interface LocationData {
  location: string;
  count: number;
}

interface MetricData {
  name: string;
  count: number;
  offers: number;
  cancellations: number;
  orders:number;
  dateRanges: {
    yesterday?: number;
  };
  offerDateRanges: { 
    yesterday?: number;
   };
  cancelDateRanges: { 
    yesterday?: number;
  }
  orderDateRanges:{
      yesterday?: number;
  }
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
  const [isLoading, setIsLoading] = useState(true);


  const [dashBoardData, setdashBoardData] = useState<DashboardData>(
    {
      inquiry: {
        name: 'inquiry',
        count: 0,
        offers: 0,
        orders:0,
        cancellations: 0,
        dateRanges: {
          yesterday:0,
        },
        offerDateRanges: {
          yesterday:0,
        },
        cancelDateRanges: {
          yesterday:0,
        },
        orderDateRanges : {
          yesterday:0,
        }
      },
      interInquiry: {
        name: 'interInquiry',
        count: 0,
        offers: 0,
        orders:0,
        cancellations: 0,
        dateRanges: {
          yesterday:0,
        },
        offerDateRanges: {
          yesterday:0,
        },
        cancelDateRanges: {
          yesterday:0,
        },
        orderDateRanges : {
          yesterday:0,
        }
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
    finally {
      setIsLoading(false);
    }

  }

  useEffect(() => {
      fetchDashboardData();
    }, [refresh]);

  const handleDeleteAll = async()=>{

    const confirmDelete = window.confirm("Are you sure you want to delete all dashboard data?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User is not authenticated.");
      return;
    }

    try {
      await axiosInstance.delete("/dashboard/delete-all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        alert("All dashboard data deleted successfully.");
        fetchDashboardData();
      
    } catch (error) {
      console.error("Error deleting dashboard data:", error);
      alert("All dashboard data deleted successfully");
      fetchDashboardData();

    }
  }


  return (
    <>
    <div className="flex justify-end mt-12 mb-4 gap-3">
      <button 
      className="flex items-center gap-2 text-sm" 
      onClick={() => {
        setIsLoading(true);
        setRefresh((prev) => !prev);
      }}
      >
        <RefreshCw className="h-3 w-3" /><span className="text-[12px] font-inter-semibold cursor-pointer">Refresh all</span>
      </button>
      <button   
       onClick={handleDeleteAll}
       className="bg-red-700 text-white text-[11px] captitalize px-2 py-1 h-[37px] cursor-pointer font-inter-semibold rounded-md">Delete All</button>
      
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 mx-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 col-span-2 h-[200px]">
        {/* Metrics Cards */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
            <Card className="py-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[22px] font-inter-semibold text-[#7f7f7f]">Inquiries</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-inter-extrabold">{(dashBoardData?.inquiry?.count || 0) + (dashBoardData?.interInquiry?.count || 0)}</p>
                    <span
                      className={`text-sm font-inter-semibold ${
                        ((dashBoardData?.inquiry?.dateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.dateRanges?.yesterday ?? 0)) > 0
                          ? "text-[#70ad4a]"
                          : "text-[#ff010b]"
                      }`}
                    >
                      {((dashBoardData?.inquiry?.dateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.dateRanges?.yesterday ?? 0)) > 0 ? "↑" : "↓"}{" "}
                      {(dashBoardData?.inquiry?.dateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.dateRanges?.yesterday ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                    <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.inquiry?.count || 0}</p>
                  </div>
                  <div>
                    <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                    <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.interInquiry?.count || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
      )}  

      {isLoading ? (
          <SkeletonCard />
        ) : (
          <Card className="py-2">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[22px] font-inter-semibold text-[#7f7f7f]">Offers</h3>
                </div>
                <div className="text-center">
                    <p className="text-4xl font-inter-extrabold">{ 
                      (dashBoardData?.inquiry?.offers || 0) + (dashBoardData?.interInquiry?.offers || 0)
                    }</p>
                    <span
                    className={`text-sm font-inter-semibold ${
                      (dashBoardData?.inquiry?.offerDateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.offerDateRanges?.yesterday ?? 0) > 0
                        ? "text-[#70ad4a]"
                        : "text-[#ff010b]"
                    }`}
                  >
                    { (dashBoardData?.inquiry?.offerDateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.offerDateRanges?.yesterday ?? 0) > 0 ? "↑" : "↓"}{" "}
                    { (dashBoardData?.inquiry?.offerDateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.offerDateRanges?.yesterday ?? 0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                  <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.inquiry?.offers || 0}</p>
                </div>
                <div>
                  <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                  <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.interInquiry?.offers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
       )}
        
      {isLoading ? (
          <SkeletonCard />
        ) : (
        <Card className="py-2">
          <CardContent className="p-4">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[22px] font-inter-semibold text-[#7f7f7f]">  <span className="block">Orders</span> Completed</h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-inter-extrabold">{(dashBoardData?.inquiry?.orders || 0)  + (dashBoardData?.interInquiry?.orders || 0)}</p>
                <span
                  className={`text-sm font-inter-semibold ${
                    ((dashBoardData?.inquiry?.orderDateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.orderDateRanges?.yesterday ?? 0)) > 0
                      ? "text-[#70ad4a]"
                      : "text-[#ff010b]"
                  }`}
                >
                  {(dashBoardData?.inquiry?.orderDateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.orderDateRanges?.yesterday ?? 0) > 0 ? "↑" : "↓"}{" "}
                  {(dashBoardData?.inquiry?.orderDateRanges?.yesterday ?? 0) + (dashBoardData?.interInquiry?.orderDateRanges?.yesterday ?? 0)}
                </span>

              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">Domestic</p>
                <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.inquiry?.orders || 0}</p>
              </div>
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.interInquiry?.orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
          <SkeletonCard />
        ) : (
        <Card className="py-2">
          <CardContent className="p-4">
          <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[22px] font-inter-semibold text-[#7f7f7f]">  <span className="block">Cancelled</span> Inquiries
                </h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-inter-extrabold">{ 
                    (dashBoardData?.inquiry?.cancellations || 0) + (dashBoardData?.interInquiry?.cancellations || 0)
                }</p>
                <span
                  className={`text-sm font-inter-semibold ${
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
                <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.inquiry?.cancellations || 0}</p>
              </div>
              <div>
                <p className="font-inter-light text-[#7f7f7f] text-[14px] mb-1">International</p>
                <p className="text-[16px] font-inter-semibold text-center">{dashBoardData?.interInquiry?.cancellations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

        <div className="col-span-2">
          {alertMessage && (
              <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
          )}
        </div>

      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6 col-span-1">
        {/* Calendar Card */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
            <div className="flex justify-center shadow rounded-2xl border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="text-8xl cursor-pointer"
              />

            </div>
        )}

        {/* Inquiry Growth Card */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-inter-semibold text-[#7F7F7F]">Inquiry Growth</h3>
              <p className="text-[10px] text-[#7F7F7F] bg-[#ECECEC] border border-[#dadada] px-2 rounded font-inter-medium">All Time</p>
            </div>
            <div className="space-y-4">
              {dashBoardData?.topLocations.map((item) => (
                <div key={item.location} className="flex items-center justify-between">
                  <span className="text-sm font-inter-medium">{item.location}</span>
                  <span className="font-inter-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
    
    
  </>
  )
}

