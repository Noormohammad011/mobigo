import { CollectionForm } from "@/components/admin/collection-form"

export const instant = false

export default function AdminNewCollectionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">New collection</h1>
      <CollectionForm />
    </div>
  )
}
