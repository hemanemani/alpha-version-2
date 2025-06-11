"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye,EyeOff, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog,DialogTitle,DialogContent,DialogFooter } from "@/components/ui/dialog";
import { authLogin } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import { RainbowButton } from "@/components/RainbowButton";
import { DarkMode } from "@/components/dark-mode";

const LoginPage: React.FC = () =>{

    const [user_name, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const { setAccessLevel, setAllowedPages } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");


    const router = useRouter();
    useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        router.replace("/dashboard"); // Redirect if already logged in
      }
    }, [router]);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

      e.preventDefault();
      setNameError(!user_name.trim());
      setPasswordError(!password.trim());
      setLoginError("");

      if (!user_name.trim() || !password.trim()) {
        return;
      }
  
      try {
        setIsLoading(true);
        const credentials = { user_name, password }; 
        const response = await authLogin(credentials,setAccessLevel, setAllowedPages);
        if (response) {
          localStorage.setItem("isLoggedIn", "true");
          setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
          }, 1000);
        
          // router.push("/dashboard");
        }
    
        } catch (error) {
          setIsLoading(false);
          setNameError(true);
          setPasswordError(true);
          setLoginError(error ? "Invalid Credentials. Try again" : '');
          
        } 
  
      };


    return (
        <div className="grid w-full min-h-screen grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          <div className="px-16 md:px-20 lg:px-20 xl:px-44 flex flex-col justify-center bg-white dark:bg-black border-r-2 dark:border-[#000] border-[#ececec] pl-0">
              <h2 className="text-4xl font-inter-extrabold text-center mb-3">Sign In</h2>
              <p className="text-[#838389] mb-12 text-center font-inter-light text-[15px]">Enter your Username and Password to sign in</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="user_name" className="text-[15px] font-inter-medium">Username</Label>
                    <Input id="user_name" 
                    type="text"
                    placeholder="Please enter username" 
                    className={`mt-2 border ${nameError ? 'border-red-500' : 'border-[#bfbfbf]'} focus:border-black font-inter-light`} 
                    value={user_name} 
                    onChange={(e) => setUserName(e.target.value)} 
                    autoComplete="username"
                    disabled={isLoading}
                    />
                  {/* {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>} */}

                </div>
                <div>
                  <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[15px] font-inter-medium">Password</Label>
                  <div className="text-[13px] text-[#777777] cursor-pointer underline font-inter-light hover:text-[#000] dark:text-white dark:hover:text-white" onClick={() => setOpenDialog(true)}>
                    Forgot Password?
                  </div>
                  </div>
                  <div className="relative mt-2">
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Please enter password"
                      className={`border ${passwordError ? 'border-red-500' : 'border-[#bfbfbf]'} focus:border-black font-inter-light`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={isLoading}
                  />
                  
                  
                  <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                  >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  </div>
                  {/* {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>} */}
                </div>
                <RainbowButton
                    type="submit"
                    disabled={isLoading} // Disable button while loading
                    className={`w-full ${isLoading ? "opacity-50 cursor-not-allowed" : ""} mt-10 h-[40px] bg-black text-white dark:bg-white dark:text-black hover:bg-black text-[16px] cursor-pointer flex justify-center items-center font-inter-semibold`}
                  >
                    {isLoading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </RainbowButton>
                  <div className="relative">
                    {loginError && (
                      <p className="text-sm text-red-500 text-center absolute top-0 left-0 w-full">
                        {loginError}
                      </p>
                    )}

                    {/* your login form fields here */}
                  </div>
              </form>


          </div>


          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="gap-6 rounded-md b">
              <DialogTitle className="text-[23px] font-inter-semibold">Forgot Password?</DialogTitle>
              <p className="text-[13px] text-[#7f7f7f] font-inter-medium">Kindly contact <span className="underline">Master Admin</span> for password reset.</p>
              <DialogFooter className="flex justify-center sm:justify-center">
                <Button className="px-10 py-0 bg-black dark:bg-white font-inter-semibold text-[12px] cursor-pointer hover:bg-black dark:hover:bg-white" onClick={() => setOpenDialog(false)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Right Section - Branding */}
          <div className="md:flex flex-col items-center justify-center p-8 bg-transparent">
              <h1 className="text-[50px] font-inter-extrabold">Alpha</h1>
              <p className="text-[#8e8e8e] font-inter-light">by Orgenik Bulk</p>
          </div>
          <div className="absolute right-2 top-2">
            <div className=" dark:bg-[#1e2939] bg-white mr-2 rounded-lg">
              <DarkMode />
            </div>  
          </div>
        </div>
    )
}

export default LoginPage;