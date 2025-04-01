import { Avatar } from "@/components/ui/avatar"
import { UserCircle } from "lucide-react"


interface User {
  id: number;
  name: string;
  email: string;
  user_name: string;
}

interface UserProfileProps {
  user: User | null;
}

const UserProfile:React.FC<UserProfileProps> = ({user}) => {
  if (!user) return <p>No user data available</p>;

  return (
    <div className="flex items-center">
      <Avatar className="w-8 h-8">
            <UserCircle className="cursor-pointer" />
      </Avatar>
      <div>
        <p className="text-[13px] font-inter-semibold leading-none">{user.name}</p>
        <p className="text-[13px] font-inter-medium text-muted-foreground">@{user.user_name}</p>
      </div>
    </div>
  )
}
export default UserProfile;
