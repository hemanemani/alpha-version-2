
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarProvider } from "@/components/ui/sidebar"
import { AlphaLogo } from "./alpha-logo"
import { MenuItems } from "./menu-items"
import UserProfile from "./user-profile"


interface User {
  id: number;
  name: string;
  email: string;
  user_name: string;
}

interface SidebarProps {
  drawerWidth: number;
  isHoverEnabled: boolean;
  hovered: boolean;
  setHovered: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;

}


const AlphaSidebar:React.FC<SidebarProps> = ({isHoverEnabled,hovered,setHovered,user}) => {


  return (
    <SidebarProvider>
      <Sidebar className={`border-r bg-[#f5f5f3] transition-all overflow-x-hidden z-50  ${isHoverEnabled ? (hovered ? "w-[240px]" : "w-[60px]") : "w-[240px]"}`}
        onMouseEnter={() => isHoverEnabled && setHovered(true)}
        onMouseLeave={() => isHoverEnabled && setHovered(false)}>
          
        <SidebarHeader className="p-4">
          {isHoverEnabled ? (
            <div className={`transition-opacity duration-300 ${
              !isHoverEnabled || hovered ? "opacity-100" : "opacity-0"
            }`}>
              <AlphaLogo />
            </div>
          ) : (
            <AlphaLogo />
          )}
        </SidebarHeader>

        <SidebarContent className="px-2">

          <div className="flex flex-col justify-start h-full">
            <div className='flex flex-col'>
              <MenuItems isHoverEnabled={isHoverEnabled} hovered={hovered} />
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4">
        {isHoverEnabled ? (hovered ?  <UserProfile user={user} /> : "") :  <UserProfile user={user} />}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default AlphaSidebar;

