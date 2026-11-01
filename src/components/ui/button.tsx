import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Button — DESIGN_SYSTEM §7.1
 * Variants: default (= primary), dark, outline, secondary, ghost, destructive, link
 * Sizes: sm 36px · default 44px (min touch target) · lg 52px (sticky buy bar)
 * Text buttons are pills (radius-full); icon buttons are radius-md squares.
 */
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-brand outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[.98] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[loading=true]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        dark: "bg-ink-950 text-white hover:bg-ink-900",
        outline:
          "border-[1.5px] border-border-strong bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border aria-expanded:bg-border",
        ghost:
          "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "bg-destructive/10 text-danger-text hover:bg-destructive/20 focus-visible:ring-destructive/30",
        link: "h-auto! rounded-sm px-0! text-link underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 gap-1 px-3 text-caption [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-4 text-body-sm [&_svg:not([class*='size-'])]:size-4",
        default: "h-11 gap-2 px-5 text-body-sm",
        lg: "h-13 gap-2 px-6 text-body",
        icon: "size-11 rounded-md",
        "icon-xs": "size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-9 rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-13 rounded-md [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner in place of the label and keeps the button's width. */
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <>
          <span className="invisible inline-flex items-center gap-[inherit]">{children}</span>
          <Loader2Icon className="absolute animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
