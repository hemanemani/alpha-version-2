
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
        {isHoverEnabled ? (hovered ?  <AlphaLogo /> : "") :  <AlphaLogo />}
        </SidebarHeader>
        <SidebarContent className="px-4">
          <MenuItems isHoverEnabled={isHoverEnabled} hovered={hovered} setHovered={setHovered} />
        </SidebarContent>
        <SidebarFooter className="p-4">
        {isHoverEnabled ? (hovered ?  <UserProfile user={user} /> : "") :  <UserProfile user={user} />}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default AlphaSidebar;

