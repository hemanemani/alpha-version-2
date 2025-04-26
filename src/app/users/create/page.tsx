"use client";

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LimitedAccessModal from "@/components/LimitedAccessModal";
import AlertMessages from "@/components/AlertMessages";
import { Edit, Eye, EyeOff, Loader } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_name: string;
  mobile_number: string;
  access_level : string;
  // access_level: "view" | "limited" | "full";
  is_admin: string;
}

const UserForm = () =>
  {
    const router = useRouter();
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);

  
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        user_name: "",
        mobile_number: "",
        access_level:"",
        // access_level: "view", // instead of "view"
        is_admin: "",
    });

    // const [access_level] = useState<"full" | "view" | "limited">("view");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
  


    const handleChange = (e: { target: { name: string; value: string } }) => {
      const { name, value } = e.target;
      
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      
        // Open modal if "limited" is selected
        if (name === "access_level" && value === "limited") {
          setModalOpen(true);
        }
      };
      

    const handleSavePages = (pages: string[]) => {
        setSelectedPages(pages);
        setModalOpen(false);
      };
    
    
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");
    
        if (!token) {
          console.log("User is not authenticated.");
          return;
        }
    
        try {
          setIsLoading(true);
          const response = await axiosInstance.post(
            "/users",
            {
              ...formData,
              allowed_pages: formData.access_level === "limited" ? selectedPages : [],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          if (response) {
            setIsSuccess(true);
            setTimeout(() => {
              setIsLoading(false);
              setAlertMessage("New User Added");
              router.push("/users");
            }, 2000);
            // router.push("/users");
          } else {
            setAlertMessage("Failed to add user");
            setIsSuccess(false); 
            setIsLoading(false);
            console.error("Failed to add user");
          }
        } catch (error) {
          setAlertMessage("Something Went Wrong...");
          setIsSuccess(false);
          setIsLoading(false);
            if (axios.isAxiosError(error)) {
              alert(error.response?.data?.error || "Something went wrong");
            } else if (error instanceof Error) {
              alert(error.message);
            } else {
              alert("An unexpected error occurred.");
            }
            console.error("Error blocking inquiry:", error);
          }
      };

    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="name" className="text-[15px]">Name</Label>
                <Input id="name" name="name" value={formData.name || ''} placeholder="Please enter name" onChange={handleChange} className="bg-white border"/>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="role" className="text-[15px]">Role</Label>
                <Select 
                name="is_admin" 
                value={formData.is_admin} 
                onValueChange={(value) => handleChange({ target: { name: "is_admin", value } })}>
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                {/* <SelectItem value="1">Master Admin</SelectItem> */}
                <SelectItem value="2" className="text-[13px] cursor-pointer">Admin</SelectItem>
                <SelectItem value="3" className="text-[13px] cursor-pointer">Admin Assistant</SelectItem>

                </SelectContent>
            </Select>
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="user_name" className="text-[15px]">Username</Label>
                <Input id="user_name" name="user_name" value={formData.user_name || ''} placeholder="Please enter username" onChange={handleChange} className="bg-white border"/>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="password" className="text-[15px]">Password</Label>
                <div className="relative mt-2">
                  <Input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password || ''} placeholder="Please enter password" onChange={handleChange} className="bg-white border"/>
                  <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="password_confirmation" className="text-[15px]">Confirm Password</Label>
                <div className="relative mt-2">
                  <Input type={showConfirmationPassword ? "text" : "password"} id="password_confirmation" name="password_confirmation" value={formData.password_confirmation || ''} placeholder="Please enter password" onChange={handleChange} className="bg-white border"/>
                  <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() => setShowConfirmationPassword(!showConfirmationPassword)}
                      disabled={isLoading}
                    >
                    {showConfirmationPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="email" className="text-[15px]">Email</Label>
                <Input id="email" name="email" value={formData.email || ''} placeholder="Please enter email" onChange={handleChange} className="bg-white border"/>
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="mobile_number" className="text-[15px]">Mobile Number</Label>
                <Input id="mobile_number" name="mobile_number" value={formData.mobile_number || ''} placeholder="Please enter phone number" onChange={handleChange} className="bg-white border"/>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="access" className="text-[15px]">Access</Label>
                <Select 
                    name="access_level" 
                    value={formData.access_level} 
                    onValueChange={(value) => handleChange({ target: { name: "access_level", value } })}
                >
                    <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] cursor-pointer">
                    <SelectValue placeholder="Select Access Level" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="view" className="text-[13px] cursor-pointer">View Access</SelectItem>
                    <SelectItem value="full" className="text-[13px] cursor-pointer">Full Access</SelectItem>
                    <SelectItem value="limited" className="text-[13px] cursor-pointer">Limited Access</SelectItem>
                    </SelectContent>
                </Select>

                {/* Limited Access Modal */}
                <LimitedAccessModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSavePages} selectedPages={selectedPages} />

                {/* Display Selected Pages (Only if Limited Access is Selected) */}
                {formData.access_level === "limited" && (
                <div className="mt-4">
                    <div className="flex justify-between">
                        <Label className="font-semibold text-sm mb-2">Accessing Pages </Label>
                        <Edit className="h-4 w-4 text-black cursor-pointer" onClick={() => setModalOpen(true)} />
                    </div>
                    <ul className="list-disc list-inside">
                    {selectedPages.map((page) => (
                        <li key={page} className="text-sm font-medium">{page}</li>
                    ))}
                    </ul>
                </div>
                )}
                
            </div>
        </div>

        <RainbowButton
          type="submit"
          disabled={isLoading} // Disable button while loading
          className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black text-white capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer`}
        >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
        ) : (
            "Add User"
          )}
        </RainbowButton>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}

      </form>
    
    
  )
}

export default UserForm;


