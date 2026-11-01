import { BrandForm } from "@/components/admin/brand-form"

export const instant = false

export default function NewBrandPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">New brand</h1>
      <BrandForm />
    </div>
  )
}
