import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-[60vh] w-full">
      <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
    </div>
  );
}
