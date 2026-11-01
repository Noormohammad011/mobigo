import { BannerForm } from "@/components/admin/banner-form"

export const instant = false

export default function AdminNewBannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">New banner</h1>
      <BannerForm />
    </div>
  )
}
