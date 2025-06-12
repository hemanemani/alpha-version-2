"use client";

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LimitedAccessModal from "@/components/LimitedAccessModal";
import { AxiosError } from "axios";
import AlertMessages from "@/components/AlertMessages";
import { Edit, Eye, EyeOff, Loader } from "lucide-react";
import { RainbowButton } from "@/components/RainbowButton";
import { SkeletonCard } from "@/components/SkeletonCard";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_name: string;
  mobile_number: string;
  access_level: "view" | "limited" | "full";
  allowed_pages: string[];
  is_admin: string;
}

interface UserApiResponse {
    user: UserFormData;
  }
  



const EditUserForm:React.FC = () =>
  {
    const router = useRouter();
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInputLoading, setIsInputLoading] = useState(true);
    const { id } = useParams<{ id: string }>() ?? {};
    
  
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        user_name: "",
        mobile_number: "",
        access_level: "view",
        allowed_pages: [],
        is_admin: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
  
    // useEffect(() => {
    // if (formData.access_level === "limited") {
    //     setSelectedPages(formData.allowed_pages || []);
    //     setModalOpen(true);
    // }
    // }, [formData.access_level, formData.allowed_pages]);

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

      useEffect(() => {
        if (id) {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.log("No token found in localStorage");
                return;
            }
            
            const fetchItem = async () => {
                try {
                    const response = await axiosInstance.get<UserApiResponse>(`users/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    setFormData(response.data.user);
                    if (response.data.user.access_level === "limited") {
                        setSelectedPages(response.data.user.allowed_pages || []);
                    }
                } catch (error) {
                    console.error('Error fetching item:', error);
                }
                finally{
                    setIsInputLoading(false);
                  }
            };
            fetchItem();
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
            const url = id ? `users/${id}` : 'users';
            const method = id ? 'put' : 'post';
                
            const response = await axiosInstance({
                method: method,
                url: url,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                data: {
                    ...formData,
                    allowed_pages: selectedPages,
                }
            });

            if (response.status >= 200 && response.status < 300) {
                setIsSuccess(true);
                setTimeout(() => {
                setIsLoading(false);
                setAlertMessage("User Updated");
                router.push("/users");
                }, 2000);      
                // router.push('/users');
            } else {
                setAlertMessage("Failed to add user");
                setIsSuccess(false); 
                setIsLoading(false);    
                console.error(`${id ? "Failed to edit" : "Failed to add"} user`, response.status);
            }  
        } catch (error) {
            setAlertMessage("Something Went Wrong...");
            setIsSuccess(false);
            setIsLoading(false);
            console.error("Error submitting user:", error);
            if (error instanceof AxiosError && error.response) {
              console.error("Validation errors:", error.response.data);
            }
          }
          
    };

    return (

      <form className="px-20 py-6" onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="name" className="text-[15px]">Name</Label>
                { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
                <Input id="name" name="name" value={formData.name || ''} placeholder="Please enter name" onChange={handleChange} className="bg-white dark:bg-[#000] border"/> 
                )}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="role" className="text-[15px]">Role</Label>
            
                { formData.is_admin == "1" ? 
                ( <Input id="isAdmin" name="is_admin" value="Master Admin" className="w-full border border-gray-300 px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white dark:bg-[#2e2e2e]"
                readOnly /> )
                :
                <Select
                name="is_admin"
                value={formData.is_admin} // Keep this as "2" or "3"
                onValueChange={(value) =>
                    handleChange({ target: { name: "is_admin", value } })
                }
                >
                <SelectTrigger className="w-full border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                    <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#000]">
                    <SelectItem value="2" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">
                    Admin
                    </SelectItem>
                    <SelectItem value="3" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">
                    Admin Assistant
                    </SelectItem>
                </SelectContent>
                </Select>
                }
                
                
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="user_name" className="text-[15px]">Username</Label>
                { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
                <Input id="user_name" name="user_name" value={formData.user_name || ''} placeholder="Please enter username" onChange={handleChange} className="bg-white dark:bg-[#000] border"/>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="password" className="text-[15px]">Password</Label>
                <div className="relative mt-2">
                    <Input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password || ''} placeholder="Please enter password" onChange={handleChange} className={`bg-white dark:bg-[#000] rounded-md ${((formData.password && formData.password.length < 7)) ? "border border-red-500" : ""}`} />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
                {formData.password && formData.password.length < 7 && (
                  <p className="text-red-500 text-sm mt-1">
                    Password must be at least 7 characters.
                  </p>
                )}
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="password_confirmation" className="text-[15px]">Password Confirmation</Label>
                <div className="relative mt-2">
                <Input type={showConfirmationPassword ? "text" : "password"} id="password_confirmation" name="password_confirmation" value={formData.password_confirmation || ''} placeholder="Please enter password" onChange={handleChange} className="bg-white dark:bg-[#000] border"/>
                <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() => setShowConfirmationPassword(!showConfirmationPassword)}
                      disabled={isLoading}
                    >
                    {showConfirmationPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {formData.password &&
                    formData.password_confirmation &&
                    formData.password !== formData.password_confirmation && (
                    <p className="text-red-500 text-sm mt-1">
                    Password and confirmation do not match.
                    </p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="email" className="text-[15px]">Email</Label>
                { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
                <Input id="email" name="email" value={formData.email || ''} placeholder="Please enter email" onChange={handleChange} className="bg-white dark:bg-[#000] border"/>
                )}
            </div>
            <div className="space-y-2 w-[80%]">
                <Label htmlFor="mobile_number" className="text-[15px]">Mobile Number</Label>
                <Input id="mobile_number" name="mobile_number" value={formData.mobile_number || ''} placeholder="Please enter phone number" onChange={handleChange} className="bg-white dark:bg-[#000] border"/>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mb-6 mt-4">
            <div className="space-y-2 w-[80%]">
                {/* Access Level Selector */}
                <div>
                    <Label className="font-semibold text-sm mb-2 block">Access</Label>
                    { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
                    <Select
                    name="access_level"
                    value={formData.access_level || ""}
                    onValueChange={(value) => handleChange({ target: { name: "access_level", value } })}
                    >
                    <SelectTrigger className="w-full h-10 border px-3 py-2 rounded-md text-[13px] text-[#000] dark:text-white cursor-pointer">
                        <SelectValue placeholder="Select Access Level" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#000]">
                        <SelectItem value="full" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Full Access</SelectItem>
                        <SelectItem value="view" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">View Access</SelectItem>
                        <SelectItem value="limited" className="text-[13px] cursor-pointer dark:hover:bg-[#2C2D2F] dark:active:bg-[#2C2D2F] dark:focus:bg-[#2C2D2F]">Limited Access</SelectItem>
                    </SelectContent>
                    </Select>
                    )}
                </div>

                {/* Limited Access Modal and Selected Pages */}
                <div>
                    { isInputLoading ? (<SkeletonCard height="h-[36px]"  /> ) : (
                    <LimitedAccessModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSavePages}
                    selectedPages={selectedPages}
                    />
                    )}
                    {/* Display Selected Pages for Reference */}
                    {formData.access_level === "limited" && (
                    <div className="mt-4 w-[74%]">
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
        </div>

        <RainbowButton
          type="submit"
          disabled={isLoading} // Disable button while loading
          className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} w-[40%] bg-black text-white dark:bg-white dark:text-black capitalize text-[15px] h-[43px] rounded-sm block ml-auto mr-auto mt-10 font-inter-semibold cursor-pointer`}
        >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin block ml-auto mr-auto" />
        ) : (
            "Update User"
          )}
        </RainbowButton>
        {alertMessage && (
            <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
        )}

      </form>
    
    
  )
}

export default EditUserForm;

