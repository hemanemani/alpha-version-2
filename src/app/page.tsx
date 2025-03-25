"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye,EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog,DialogContent,DialogFooter } from "@/components/ui/dialog";
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
          setAlertMessage("Login successful! Redirecting to dashboard...");
          setIsSuccess(true);
          setTimeout(() => router.push("/dashboard"), 2000);
          router.refresh();
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
          <div className="px-16 md:px-24 lg:px-44 xl:px-44 flex flex-col justify-center bg-white border-2 border-[#ececec]">
              <h2 className="text-4xl font-bold text-center mb-3">Sign In</h2>
              <p className="text-[#838389] mb-12 text-center font-inter-light">Enter your Username and Password to sign in</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="user_name" className="text-[15px]">Username</Label>
                    <Input id="user_name" placeholder="Please enter username" className="mt-2 border-1 border-[#bfbfbf]" value={user_name} onChange={(e) => setUserName(e.target.value)} autoComplete="username"

                    />
                  {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}

                </div>
                <div>
                  <div className="flex justify-between">
                  <Label htmlFor="password" className="text-[15px]">Password</Label>
                  <div className="text-sm text-[#777777] cursor-pointer underline" onClick={() => setOpenDialog(true)}>
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
                <Button type="submit" className="w-full mt-4 h-[40px] bg-black text-white hover:bg-black text-[16px] cursor-pointer">Submit</Button>
                {alertMessage && (
                      <AlertMessages message={alertMessage} isSuccess={isSuccess!} />
                  )}
              </form>


          </div>


          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <h3 className="text-lg font-semibold">Forgot Password?</h3>
              <p className="text-sm text-gray-600">Kindly contact <span className="underline">Master Admin</span> for password reset.</p>
              <DialogFooter>
                <Button onClick={() => setOpenDialog(false)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Right Section - Branding */}
          <div className="md:flex flex-col items-center justify-center p-8 bg-transparent">
              <h1 className="text-[50px] font-bold font-inter-bold">Alpha</h1>
              <p className="text-[#8e8e8e] font-inter">by Orgenik Bulk</p>
          </div>
        </div>
    )
}

export default LoginPage;