
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarProvider } from "@/components/ui/sidebar"
import { AlphaLogo } from "./alpha-logo"
import { MenuItems } from "./menu-items"
import { UserProfile } from "./user-profile"
import { useState } from "react"

interface SidebarProps {
  drawerWidth: number;
  isHoverEnabled: boolean;
  hovered: boolean;
  setHovered: React.Dispatch<React.SetStateAction<boolean>>;
}

const AlphaSidebar:React.FC<SidebarProps> = ({isHoverEnabled,hovered,setHovered}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const renderSearchBar = () =>{
    return(
      <div className="relative mt-10 mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search" className="pl-8 bg-white border-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
    )
  }

  const renderMenuHeader = () =>{
    return(
      <h2 className="mb-2 px-2 text-[0.8rem] font-[500] text-[#8e8081]">Menu</h2>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar className={`border-r bg-[#f5f5f3] transition-all overflow-x-hidden z-50  ${isHoverEnabled ? (hovered ? "w-[240px]" : "w-[60px]") : "w-[240px]"}`}
        onMouseEnter={() => isHoverEnabled && setHovered(true)}
        onMouseLeave={() => isHoverEnabled && setHovered(false)}>
        <SidebarHeader className="p-4">
        {isHoverEnabled ? (hovered ?  <AlphaLogo /> : "") :  <AlphaLogo />}
        {isHoverEnabled ? (hovered ?  renderSearchBar() : "") :  renderSearchBar()}
        </SidebarHeader>
        <SidebarContent className="px-4">
        {isHoverEnabled ? (hovered ?  renderMenuHeader() : "") :  renderMenuHeader()}
          <MenuItems />
        </SidebarContent>
        <SidebarFooter className="p-4">
        {isHoverEnabled ? (hovered ?  <UserProfile /> : "") :  <UserProfile />}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default AlphaSidebar;

