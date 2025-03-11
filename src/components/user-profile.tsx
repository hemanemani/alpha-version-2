import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfile() {
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src="" alt="@appoorvaa21" />
        <AvatarFallback>AA</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium leading-none">Apporva</p>
        <p className="text-xs text-muted-foreground">@appoorvaa21</p>
      </div>
    </div>
  )
}

