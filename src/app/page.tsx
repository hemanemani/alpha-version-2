"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye,EyeOff, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog,DialogTitle,DialogContent,DialogFooter } from "@/components/ui/dialog";
import { authLogin } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import AlertMessages from "@/components/AlertMessages";


const LoginPage: React.FC = () =>{

    const [user_name, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const { setAccessLevel, setAllowedPages } = useAuth();
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

      e.preventDefault();
      setNameError("");
      setPasswordError("");
    
      if (!user_name) {
        setNameError("Username is required.");
        return;
      }
  
      if (!password) {
        setPasswordError("Password is required.");
        return;
      }
  
      try {
        const credentials = { user_name, password }; 
        const response = await authLogin(credentials,setAccessLevel, setAllowedPages);
        if (response) {
          localStorage.setItem("isLoggedIn", "true");
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
          }, 2000);
        
          // router.push("/dashboard");
        }
        } catch (error) {
          setAlertMessage("Login Failed...");
          setIsSuccess(false);
          console.error("Login failed:", error);
        } finally {
        }
  
      };


    return (
        <div className="grid w-full min-h-screen grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          <div className="px-16 md:px-24 lg:px-44 xl:px-44 flex flex-col justify-center bg-white border-r-2 border-[#ececec]">
              <h2 className="text-4xl font-inter-extrabold text-center mb-3">Sign In</h2>
              <p className="text-[#838389] mb-12 text-center font-inter-light text-[15px]">Enter your Username and Password to sign in</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="user_name" className="text-[15px] font-inter-medium">Username</Label>
                    <Input id="user_name" placeholder="Please enter username" className="mt-2 border-1 border-[#bfbfbf]" value={user_name} onChange={(e) => setUserName(e.target.value)} autoComplete="username"

                    />
                  {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}

                </div>
                <div>
                  <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[15px] font-inter-medium">Password</Label>
                  <div className="text-[13px] text-[#777777] cursor-pointer underline font-inter" onClick={() => setOpenDialog(true)}>
                    Forgot Password?
                  </div>
                  </div>
                  <div className="relative mt-2">
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Please enter password"
                      className={`border ${passwordError ? 'border-red-500' : 'border-[#bfbfbf]'}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                  />
                  
                  
                  <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  </div>
                  {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>} {/* ✅ Show error manually */}
                </div>
                <Button
                    type="submit"
                    className="w-full mt-10 h-[40px] bg-black text-white hover:bg-black text-[16px] cursor-pointer flex justify-center items-center"
                    disabled={isLoading} // Disable button while loading
                  >
                    {isLoading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>


                {alertMessage && (
                      <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
                  )}
              </form>


          </div>


          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="gap-6 rounded-md b">
              <DialogTitle className="text-[23px] font-inter-semibold">Forgot Password?</DialogTitle>
              <p className="text-[13px] text-[#7f7f7f]">Kindly contact <span className="underline">Master Admin</span> for password reset.</p>
              <DialogFooter className="flex justify-center sm:justify-center">
                <Button className="px-10 py-0 bg-black font-inter text-[12px] cursor-pointer hover:bg-black" onClick={() => setOpenDialog(false)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Right Section - Branding */}
          <div className="md:flex flex-col items-center justify-center p-8 bg-transparent">
              <h1 className="text-[50px] font-inter-extrabold">Alpha</h1>
              <p className="text-[#8e8e8e] font-inter-light">by Orgenik Bulk</p>
          </div>
        </div>
    )
}

export default LoginPage;