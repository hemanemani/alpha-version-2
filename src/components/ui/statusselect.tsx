import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Move, Ban } from "lucide-react"

const options = [
  { value: "2", label: "Select Status", icon: null, disabled: true },
  { value: "1", label: "Move to Offers", icon: <Move className="h-4 w-4 text-gray-500" /> },
  { value: "0", label: "Cancel", icon: <Ban className="h-4 w-4 text-gray-500" /> },
]

export default function StatusSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm  cursor-pointer">
        <span className="flex items-center gap-2">
          {selectedOption?.icon} {selectedOption?.label}
        </span>
      </SelectTrigger>
      <SelectContent className="w-full bg-white border border-gray-300 rounded-md shadow-md">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled} className="flex items-center gap-2 cursor-pointer">
            {option.icon} {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
