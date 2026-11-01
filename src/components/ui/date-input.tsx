import * as React from "react"

import { cn } from "@/lib/utils"

import { Input } from "./input"

/** Date / datetime-local field using shared Input tokens and global calendar styling. */
function DateInput({ className, type = "date", ...props }: React.ComponentProps<"input">) {
  if (type !== "date" && type !== "datetime-local") {
    return <Input className={className} type={type} {...props} />
  }

  return (
    <Input
      type={type}
      data-slot="date-input"
      className={cn("tabular-nums", className)}
      {...props}
    />
  )
}

export { DateInput }
