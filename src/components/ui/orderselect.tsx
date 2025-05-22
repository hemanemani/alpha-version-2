import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Ban } from "lucide-react"

export default function OrdersSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const statusOptions = [
    { value: "placeholder", label: "Not Ordered", icon: null, disabled: true },
    { value: "3", label: "Ordered", icon: <Ban className="h-4 w-4 text-gray-500" /> },
  
  ]

  const selectedOption = statusOptions.find((option) => option.value === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full px-3 py-2 border rounded-md text-sm cursor-pointer">
        <span className="flex items-center gap-2">
          {selectedOption?.icon} {selectedOption?.label}
        </span>
      </SelectTrigger>
      <SelectContent className="w-full bg-white rounded-md">
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="flex items-center gap-2 cursor-pointer text-[13px]"
          >
            {option.icon} {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}


