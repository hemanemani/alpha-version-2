"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { AxiosError } from 'axios';
import AlertMessages from "@/components/AlertMessages";
import { format } from "date-fns";
import { DatePicker } from "@/components/date-picker";
import { Loader } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AudienceSelect from "@/components/AudienceSelect";
import { SkeletonCard } from "@/components/SkeletonCard";


interface AdFormData{
  id: number;
  ad_title:string;
  type: string;
  date_published: string | undefined;
  platform: string;
  status: string;
  goal: string;
  audience: string[];
  budget_set: number;
  views: string;
  reach: string;
  messages_received: string;
  cost_per_message: string;
  top_location: string;
  post_reactions: string;
  post_shares: string;
  post_save: string;
  total_amount_spend: number;
  duration : string;
  post_type: string;

}


const AdCreateForm = () =>
  {
    const router = useRouter();
  
    const [formData, setFormData] = useState<AdFormData>({
        id: 0,
        ad_title: '',
        type: '',
        date_published: undefined,
        platform: '',
        status: '',
        goal: '',
        audience: [],
        budget_set: 0,
        views: '',
        reach: '',
        messages_received: '',
        cost_per_message: '',
        top_location: '',
        post_reactions: '',
        post_shares: '',
        post_save: '',
        total_amount_spend: 0,
        duration: '',
        post_type:''
    });
      

    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams<{ id: string }>() ?? {};
    const [isInputLoading, setIsInputLoading] = useState(true);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleDateChange = (date: Date | undefined, field: keyof AdFormData) => {
          setFormData((prev) => ({
            ...prev,
            [field]: date ? format(date, "yyyy-MM-dd") : undefined, // ✅ Store as "YYYY-MM-DD" format
          }));
        };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({
          ...prev,
          [field]: value,
        }));
      };
      
    useEffect(() => {
      if (id) {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found!");
          return;
        }
  
        const fetchAd = async () => {
          try {
            const response = await axiosInstance.get(`/ads/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const data = response.data.data  
            if (data) {
              setFormData({ 
                  ...data,
                  audience: Array.isArray(data.audience)
              ? data.audience
              : typeof data.audience === "string"
                ? data.audience.split(',').map((a:string) => a.trim())
                : [],
              });
            } else {
              console.error("Ad not found!");
            }
          } catch (error) {
            console.error("Error fetching ad:", error);
          } finally {
            setIsInputLoading(false);
            setIsLoading(false);
          }
        };
  
        fetchAd();
      }
    }, [id]);
    

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.log("User is not authenticated.");
            return;
        }

        try {
            setIsLoading(true);
            const url = id ? `ads/${id}` : 'ads';
            const method = id ? 'put' : 'post';

            const payload = {
              ...formData,
            };

                
            const response = await axiosInstance({
                method: method,
                url: url,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                data: payload,

            });

            setFormData(response.data);
      

            if (response.status >= 200 && response.status < 300) {
                setIsSuccess(true);
                setTimeout(() => {
                setIsLoading(false);
                setAlertMessage("Ad Updated");
                router.push("/ads");
                }, 2000);      
            } else {
                setAlertMessage("Failed to add ad");
                setIsSuccess(false); 
                setIsLoading(false);    
                console.error(`${id ? "Failed to edit" : "Failed to add"} add`, response.status);
            }  
        } catch (error) {
            setAlertMessage("Something Went Wrong...");
            setIsSuccess(false);
            setIsLoading(false);
            console.error("Error submitting ad:", error);
            if (error instanceof AxiosError && error.response) {
              console.error("Validation errors:", error.response.data);
            }
          }
          
    };
    
    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="adTitle" className="text-[15px] font-inter-medium">Ad Title</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input id="adTitle" name="ad_title" value={formData.ad_title || ''} placeholder="Please enter ad title" onChange={handleChange} className="bg-white dark:bg-[#000] border" />
            }
          </div>
          <div className="space-y-2 w-[80%]">
            <Label htmlFor="type" className="text-[15px] font-inter-medium">Type</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :

              <Select name="type" value={formData.type ?? ''}
                onValueChange={(value: string) => handleSelectChange('type',value)}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#000]">
                  <SelectItem value="domestic" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Domestic</SelectItem>
                  <SelectItem value="international" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">International</SelectItem>
                </SelectContent>
              </Select>
            }
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="datePublished" className="text-[15px] font-inter-medium">Date Published</Label>
                <div className='bg-white dark:bg-[#000] border'>
                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                <DatePicker 
                    id="datePublished"
                    date={formData.date_published ? new Date(formData.date_published) : undefined} 
                    setDate={(date) => handleDateChange(date, "date_published")} 
                    placeholder="DD-MM-YYYY" 
                  />
                }
                </div>
            </div>

            <div className="space-y-2 w-[80%]">
            <Label htmlFor="platform" className="text-[15px] font-inter-medium">Platform</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :

              <Select name="platform" value={formData.platform ?? ''} 
                onValueChange={(value: string) => handleSelectChange('platform', value)}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#000]">
                  <SelectItem value="instagram" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Instagram</SelectItem>
                  <SelectItem value="facebook" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Facebook</SelectItem>
                  <SelectItem value="meta" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Meta</SelectItem>

                </SelectContent>
              </Select>
            }
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="status" className="text-[15px] font-inter-medium">Select Status</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :

              <Select name="status" value={formData.status ?? ''} 
                onValueChange={(value: string) => handleSelectChange('status',value)}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#000]">
                  <SelectItem value="completed" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Completed</SelectItem>
                  <SelectItem value="inprogress" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">In Progress</SelectItem>
                </SelectContent>
              </Select>
            }
            </div>
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="goal" className="text-[15px] font-inter-medium">Select Goal</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
              <Select name="goal" value={formData.goal ?? ''} 
                onValueChange={(value: string) => handleSelectChange('goal',value)}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                  <SelectValue placeholder="Select Goal" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#000]">
                  <SelectItem value="messages" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Messages</SelectItem>
                  <SelectItem value="profile_views" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Profile Views</SelectItem>
                  <SelectItem value="website_traffic" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Website Traffic</SelectItem>
                </SelectContent>
              </Select>
            }
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="audience" className="text-[15px] font-inter-medium">Audience</Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
              <AudienceSelect
                  label="Audience"
                  name="audience"
                  value={formData.audience}
                  onChange={(val) => setFormData((prev) => ({ ...prev, audience: val }))}
                  defaultOptions={[
                    { value: "india", label: "India" },
                    { value: "uae", label: "UAE" },
                    { value: "others", label: "Others" },
                  ]}
                />
              }
            </div>
            
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="budgetSet" className="text-[15px] font-inter-medium">Budget Set</Label>
                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                <Input id="budgetSet"  name="budget_set" value={formData.budget_set || ''} onChange={handleChange} placeholder="Please enter budget set" className="border bg-white dark:bg-[#000]"/>
                }
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="views" className="text-[15px] font-inter-medium">Views</Label>
                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                <Input id="views" name="views" value={formData.views || ''} onChange={handleChange} placeholder="Please enter views" className="border bg-white dark:bg-[#000]"/>
                }
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="reach" className="text-[15px] font-inter-medium">Reach</Label>
                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                <Input id="reach" name="reach" value={formData.reach || ''} onChange={handleChange} placeholder="Please enter reach" className="border bg-white dark:bg-[#000]"/>
                }
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="messagesReceived" className="text-[15px] font-inter-medium">Messages Received</Label>
                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                <Input id="messagesReceived" name="messages_received" value={formData.messages_received || ''} onChange={handleChange} placeholder="Please enter messages received" className="border bg-white dark:bg-[#000]"/>
                }
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="costPerMessage" className="text-[15px] font-inter-medium">Cost Per Message</Label>
                { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
                <Input id="costPerMessage" name="cost_per_message" value={formData.cost_per_message || ''} onChange={handleChange} placeholder="Please enter cost per message" className="border bg-white dark:bg-[#000]"/>
                }
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="topLocation" className="text-[15px] font-inter-medium">
                Top Location
            </Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input
                id="topLocation"
                name="top_location"
                value={formData.top_location || ''}
                onChange={handleChange}
                placeholder="Please enter top location"
                className="border bg-white dark:bg-[#000]"
            />
            }
            </div>

            <div className="space-y-2 w-[80%]">
            <Label htmlFor="postReactions" className="text-[15px] font-inter-medium">
                Post Reactions
            </Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input
                id="postReactions"
                name="post_reactions"
                value={formData.post_reactions || ''}
                onChange={handleChange}
                placeholder="Please enter post reactions"
                className="border bg-white dark:bg-[#000]"
            />
            }
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="postShares" className="text-[15px] font-inter-medium">
                Post Shares
            </Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :

            <Input
                id="postShares"
                name="post_shares"
                value={formData.post_shares || ''}
                onChange={handleChange}
                placeholder="Please enter post shares"
                className="border bg-white dark:bg-[#000]"
            />
            }
            </div>

            <div className="space-y-2 w-[80%]">
            <Label htmlFor="postSave" className="text-[15px] font-inter-medium">
                Post Save
            </Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input
                id="postSave"
                name="post_save"
                value={formData.post_save || ''}
                onChange={handleChange}
                placeholder="Please enter post save"
                className="border bg-white dark:bg-[#000]"
            />
            }
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="totalAmountSpend" className="text-[15px] font-inter-medium">
                Total Amount Spend
            </Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input
                
                id="totalAmountSpend"
                name="total_amount_spend"
                value={formData.total_amount_spend || ''}
                onChange={handleChange}
                placeholder="Please enter total amount spend"
                className="border bg-white dark:bg-[#000]"
            />
            }
            </div>

            {/* Duration */}
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="duration" className="text-[15px] font-inter-medium">
                Duration
            </Label>
            { isInputLoading ? <SkeletonCard height="h-[36px]" /> :
            <Input
                id="duration"
                name="duration"
                value={formData.duration || ''}
                onChange={handleChange}
                placeholder="Please enter duration"
                className="border bg-white dark:bg-[#000]"
            />
            }
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
            <Label htmlFor="post_type" className="text-[15px] font-inter-medium">Post Type</Label>
              <Select name="post_type" value={formData.post_type ?? ''} 
                onValueChange={(value: string) => handleSelectChange('post_type',value)}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                  <SelectValue placeholder="Select Post Type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#000]">
                  <SelectItem value="story" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Story</SelectItem>
                  <SelectItem value="reels" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Reels</SelectItem>
                  <SelectItem value="post" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Post</SelectItem>

                </SelectContent>
              </Select>
            </div>
        </div>
    
        <RainbowButton 
         type="submit"
         className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black dark:bg-[#111111] dark:text-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer `}
         disabled={isLoading}
         >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
        ) : (
            "Add Ad"
          )}
        </RainbowButton>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}
      </form>
    
    
  )
}

export default AdCreateForm;