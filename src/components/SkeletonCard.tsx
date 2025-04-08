import { Skeleton } from "@/components/ui/skeleton"

type CardProps = {
  height?: string;
  className?: string;
};

export function SkeletonCard({ height = "h-[200px]", className = "" }: CardProps) {
  return (
    <div>
      <Skeleton className={`w-full rounded-md ${height} ${className}`} />
      {/* <div className="space-y-2">
        <Skeleton className="h-4 w-[100%]" />
        <Skeleton className="h-6 w-[100%]" />
        <Skeleton className="h-4 w-[100%]" />
      </div> */}
    </div>
  )
}
