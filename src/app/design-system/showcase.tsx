"use client"

import { useState } from "react"
import { HeartIcon, ShoppingCartIcon, SlidersHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { Wordmark } from "@/components/brand/wordmark"
import { ChipRow, ChoiceChip, ChoiceChipGroup, FilterChip } from "@/components/commerce/chip"
import { PhoneInput } from "@/components/commerce/phone-input"
import { Price, PriceBlock } from "@/components/commerce/price-block"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { SavePill } from "@/components/commerce/save-pill"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const palette = [
  ["ink", ["50", "100", "200", "300", "500", "700", "900", "950"]],
  ["primary", ["50", "100", "400", "500", "600", "700"]],
  ["save", ["50", "600", "700"]],
  ["deal", ["500"]],
  ["danger", ["500", "700"]],
  ["warning", ["500", "700"]],
  ["info", ["500"]],
] as const

const semantic = [
  ["background", "bg-background"],
  ["muted (bg-subtle)", "bg-muted"],
  ["header", "bg-header"],
  ["primary", "bg-primary"],
  ["primary-hover", "bg-primary-hover"],
  ["accent", "bg-accent"],
  ["save", "bg-save"],
  ["border", "bg-border"],
  ["border-strong", "bg-border-strong"],
  ["destructive", "bg-destructive"],
] as const

const type = [
  ["text-display", "Pay when it arrives.", "font-display"],
  ["text-h1", "Galaxy S26 Ultra 5G", "font-display"],
  ["text-h2", "Best Deals", "font-display"],
  ["text-h3", "Is this the official variant?", "font-display"],
  ["text-price-lg", "৳116,499", "font-price"],
  ["text-price", "৳116,499", "font-price"],
  ["text-body", "Every phone comes with an official warranty and free delivery inside Dhaka.", ""],
  ["text-body-sm", "Galaxy S26 Ultra 5G · 12GB/256GB", ""],
  ["text-caption", "Inclusive of VAT", ""],
  ["text-overline", "DISPLAY", "uppercase text-muted-foreground"],
] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  )
}

export function Showcase() {
  const [qty, setQty] = useState(1)
  const [storage, setStorage] = useState("256")
  const [color, setColor] = useState("black")
  const [brands, setBrands] = useState<string[]>(["Samsung"])
  const prices: Record<string, [number, number]> = { "256": [116499, 117000], "512": [129999, 134000], "1024": [149999, 149999] }
  const [price, compareAt] = prices[storage]

  return (
    <div className="flex flex-col">
      <div className="page-container flex flex-col gap-10 py-8 lg:gap-14">
        <div className="flex flex-col gap-2">
          <p className="text-overline text-primary uppercase">MobiGo Design System v1.0</p>
          <h1 className="text-display">Tokens & components</h1>
          <p className="max-w-2xl text-muted-foreground">
            Tailwind CSS v4 tokens on the shadcn/ui variable contract. Source of truth: docs/DESIGN_SYSTEM.md.
          </p>
        </div>

        <Section title="Brand">
          <div className="flex w-fit items-center rounded-lg bg-header px-5 py-4">
            <Wordmark />
          </div>
        </Section>

        <Section title="Palette">
          <div className="flex flex-col gap-3">
            {palette.map(([name, steps]) => (
              <div key={name} className="flex flex-wrap items-center gap-2">
                <span className="w-16 text-caption text-muted-foreground">{name}</span>
                {steps.map((s) => (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className="size-11 rounded-sm border border-black/5" style={{ background: `var(--color-${name}-${s})` }} />
                    <span className="text-caption text-muted-foreground">{s}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Semantic tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {semantic.map(([name, cls]) => (
              <div key={name} className="flex items-center gap-2">
                <div className={`size-9 shrink-0 rounded-sm border border-black/5 ${cls}`} />
                <span className="text-caption">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div className="flex flex-col gap-3">
            {type.map(([cls, sample, extra]) => (
              <div key={cls} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:items-baseline">
                <code className="text-caption text-muted-foreground">{cls}</code>
                <p className={`${cls} ${extra}`}>{sample}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius & elevation">
          <div className="flex flex-wrap gap-4">
            {(["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-full"] as const).map((r) => (
              <div key={r} className={`grid size-20 place-items-center border border-border bg-muted text-caption ${r}`}>
                {r.replace("rounded-", "")}
              </div>
            ))}
            {(["shadow-xs", "shadow-md", "shadow-lg", "shadow-bar"] as const).map((s) => (
              <div key={s} className={`grid size-20 place-items-center rounded-lg bg-card text-caption ${s}`}>
                {s}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Buy Now</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="outline">Add to Cart</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Remove</Button>
            <Button variant="link">View all →</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small 36</Button>
            <Button>Default 44</Button>
            <Button size="lg">Large 52</Button>
            <Button size="icon" variant="outline" aria-label="Add to wishlist">
              <HeartIcon />
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="Add to cart">
              <ShoppingCartIcon />
            </Button>
            <Button loading>Placing order</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Badges & SavePill">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="5g">5G</Badge>
            <Badge variant="new">NEW</Badge>
            <Badge variant="hot">HOT DEAL</Badge>
            <Badge variant="preorder">Pre-order</Badge>
            <Badge variant="out">Out of stock</Badge>
            <SavePill amount={4000} />
          </div>
        </Section>

        <Section title="Price">
          <div className="flex flex-wrap gap-10">
            <Price price={116499} compareAtPrice={117000} from />
            <PriceBlock price={price} compareAtPrice={compareAt} />
          </div>
        </Section>

        <Section title="Chips">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Brand filter (toggle)</Label>
              <ChipRow>
                {["Samsung", "Apple", "Xiaomi", "OnePlus", "Realme", "Vivo", "Oppo", "Google"].map((b) => (
                  <FilterChip
                    key={b}
                    pressed={brands.includes(b)}
                    onPressedChange={(p) => setBrands((cur) => (p ? [...cur, b] : cur.filter((x) => x !== b)))}
                  >
                    {b}
                  </FilterChip>
                ))}
              </ChipRow>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <FilterChip key={b} onRemove={() => setBrands((cur) => cur.filter((x) => x !== b))}>
                    {b}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label id="color-label">Color</Label>
              <ChoiceChipGroup aria-labelledby="color-label" value={color} onValueChange={(v) => setColor(v as string)}>
                <ChoiceChip value="black" swatch="#1d1d1f">Titanium Black</ChoiceChip>
                <ChoiceChip value="violet" swatch="#5b4b8a">Cobalt Violet</ChoiceChip>
                <ChoiceChip value="silver" swatch="#d9d9de">Silver</ChoiceChip>
              </ChoiceChipGroup>
            </div>
            <div className="flex flex-col gap-2">
              <Label id="storage-label">Storage</Label>
              <ChoiceChipGroup aria-labelledby="storage-label" value={storage} onValueChange={(v) => setStorage(v as string)}>
                <ChoiceChip value="256">12GB / 256GB</ChoiceChip>
                <ChoiceChip value="512">12GB / 512GB</ChoiceChip>
                <ChoiceChip value="1024" unavailable>
                  16GB / 1TB
                </ChoiceChip>
              </ChoiceChipGroup>
            </div>
          </div>
        </Section>

        <Section title="Forms">
          <div className="grid max-w-xl gap-5">
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" placeholder="Rahim Uddin" autoComplete="name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
              <PhoneInput id="phone" />
              <FieldDescription>We call to confirm your order.</FieldDescription>
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="area">Area</FieldLabel>
              <Input id="area" aria-invalid defaultValue="" />
              <FieldError>Enter your area or thana.</FieldError>
            </Field>
            <Field>
              <FieldLabel>Division</FieldLabel>
              <Select
                items={[
                  { label: "Dhaka", value: "dhaka" },
                  { label: "Chattogram", value: "chattogram" },
                  { label: "Sylhet", value: "sylhet" },
                ]}
                defaultValue="dhaka"
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dhaka">Dhaka</SelectItem>
                  <SelectItem value="chattogram">Chattogram</SelectItem>
                  <SelectItem value="sylhet">Sylhet</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="note">Order note</FieldLabel>
              <Textarea id="note" placeholder="Landmark, delivery time…" />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="save-address" defaultChecked />
              <FieldLabel htmlFor="save-address" className="font-medium">
                Save this address
              </FieldLabel>
            </Field>
            <div className="flex items-center gap-4">
              <QuantityStepper value={qty} onValueChange={setQty} stock={3} />
              <span className="text-caption text-muted-foreground">max = min(stock 3, 5)</span>
            </div>
          </div>
        </Section>

        <Section title="Overlays & feedback">
          <div className="flex flex-wrap items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>
                <SlidersHorizontalIcon /> Filters
              </SheetTrigger>
              <SheetContent side="bottom">
                <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden="true" />
                <SheetHeader className="flex-row items-center justify-between">
                  <SheetTitle className="text-h3">Filters</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 overflow-y-auto px-4">
                  <Accordion defaultValue={["price"]}>
                    <AccordionItem value="price">
                      <AccordionTrigger>Price</AccordionTrigger>
                      <AccordionContent>
                        <Slider defaultValue={[20000, 150000]} min={5000} max={250000} step={1000} aria-label="Price range" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ram">
                      <AccordionTrigger>RAM</AccordionTrigger>
                      <AccordionContent>8GB · 12GB · 16GB</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <SheetFooter className="border-t border-border">
                  <Button size="lg" className="w-full">
                    Show 42 phones
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={() => toast.success("Added to cart")}>
              Toast: success
            </Button>
            <Button variant="outline" onClick={() => toast.error("Only 2 left in stock")}>
              Toast: error
            </Button>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" />}>Hover for tooltip</TooltipTrigger>
              <TooltipContent>Not available in this color</TooltipContent>
            </Tooltip>
          </div>
          <Tabs defaultValue="specs" className="max-w-xl">
            <TabsList>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="text-body-sm text-muted-foreground">
              6.9″ Dynamic LTPO AMOLED 2X · Snapdragon 8 Elite Gen 5
            </TabsContent>
            <TabsContent value="faq" className="text-body-sm text-muted-foreground">
              Yes, this is the official Bangladesh variant.
            </TabsContent>
          </Tabs>
          <div className="grid w-44 gap-2" aria-label="Loading product" role="status">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </Section>
      </div>
    </div>
  )
}
