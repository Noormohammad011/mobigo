import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** BD mobile number pattern, shared with the DB CHECK constraint (SCHEMA.md §5). */
export const BD_PHONE_PATTERN = /^01[3-9]\d{8}$/

/** Phone input (DESIGN_SYSTEM §7.16): "+880" adornment, inputmode=tel. */
export function PhoneInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-input pr-3 pl-3.5 text-[15px] text-muted-foreground"
      >
        +880
      </span>
      <Input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="01XXXXXXXXX"
        pattern={BD_PHONE_PATTERN.source}
        className={cn("pl-[4.75rem]", className)}
        {...props}
      />
    </div>
  )
}
