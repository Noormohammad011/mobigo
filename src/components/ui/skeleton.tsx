import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-md bg-skeleton bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.6),transparent)] bg-size-[200%_100%] animate-shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
