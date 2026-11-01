"use client"

import Image from "next/image"
import Link from "next/link"
import { useActionState, useMemo, useState, useTransition } from "react"

import { deleteProductImageAction, saveProductAction, uploadProductImageAction } from "@/app/admin/catalog/actions"
import type { ProductEditClientPayload } from "@/lib/admin/serialize-product-edit"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import { FormSelect, SelectField } from "@/components/ui/form-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ColorRow = { id?: string; name: string; hex: string; sortOrder: number; images: { id: string; url: string; alt: string; sortOrder: number }[] }
type VariantRow = {
  id?: string
  colorId: string
  ramGb: number
  storageGb: number
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
  reservedStock: number
  warrantyType: "OFFICIAL" | "UNOFFICIAL"
  isActive: boolean
}
type SpecGroup = { name: string; attributes: { id: string; name: string; unit: string | null }[] }

type ProductPayload = ProductEditClientPayload

export const ProductEditForm = ({
  product,
  specGroups,
  brands,
}: {
  product: ProductPayload
  specGroups: SpecGroup[]
  brands: { id: string; name: string }[]
}) => {
  const [colors, setColors] = useState<ColorRow[]>(product.colors)
  const [variants, setVariants] = useState<VariantRow[]>(
    product.variants.map((variant) => ({
      id: variant.id,
      colorId: variant.colorId,
      ramGb: variant.ramGb,
      storageGb: variant.storageGb,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stock: variant.stock,
      reservedStock: variant.reservedStock,
      warrantyType: variant.warrantyType,
      isActive: variant.isActive,
    }))
  )
  const specMap = useMemo(() => {
    const map = new Map<string, string>()
    product.specs.forEach((row) => map.set(row.attributeId, row.value))
    return map
  }, [product.specs])
  const [specValues, setSpecValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    specGroups.forEach((group) =>
      group.attributes.forEach((attribute) => {
        initial[attribute.id] = specMap.get(attribute.id) ?? ""
      })
    )
    return initial
  })

  const [state, saveAction, saving] = useActionState(saveProductAction, undefined)

  const colorOptions = colors.map((color, index) => ({
    key: color.id ?? `idx:${index}`,
    label: color.name || `Color ${index + 1}`,
  }))

  const handleAddColor = () => {
    setColors((prev) => [...prev, { name: "New color", hex: "#888888", sortOrder: prev.length, images: [] }])
  }

  const handleAddVariant = () => {
    const colorKey = colorOptions[0]?.key ?? "idx:0"
    setVariants((prev) => [
      ...prev,
      {
        colorId: colorKey,
        ramGb: 8,
        storageGb: 256,
        sku: "",
        price: 0,
        compareAtPrice: null,
        stock: 0,
        reservedStock: 0,
        warrantyType: "OFFICIAL",
        isActive: true,
      },
    ])
  }

  return (
    <form action={saveAction} className="flex flex-col gap-8">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="colorsJson" value={JSON.stringify(colors.map(({ images: _images, ...color }, index) => ({ ...color, id: color.id })))} />
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants.map(({ reservedStock: _r, ...variant }) => variant))} />
      <input
        type="hidden"
        name="specValuesJson"
        value={JSON.stringify(
          Object.entries(specValues).map(([attributeId, value]) => ({ attributeId, value }))
        )}
      />

      {state?.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="font-display text-h3 text-foreground">Base</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="brandId">Brand</Label>
            <FormSelect
              name="brandId"
              defaultValue={product.brandId}
              options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <FormSelect
              name="status"
              defaultValue={product.status}
              options={(["DRAFT", "ACTIVE", "PREORDER", "DISCONTINUED"] as const).map((entry) => ({
                value: entry,
                label: entry,
              }))}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={product.name} />
            <p className="text-caption text-muted-foreground">
              Slug: <span className="font-mono text-foreground">{product.slug}</span> (updates from the name when you save)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="modelNumber">Model number</Label>
            <Input id="modelNumber" name="modelNumber" defaultValue={product.modelNumber ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="releaseDate">Release date</Label>
            <DateInput id="releaseDate" name="releaseDate" type="date" defaultValue={product.releaseDate ?? ""} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={product.shortDescription ?? ""} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">Description (HTML)</Label>
            <Textarea id="description" name="description" rows={6} defaultValue={product.description ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input id="metaTitle" name="metaTitle" defaultValue={product.metaTitle ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="metaDescription">Meta description</Label>
            <Input id="metaDescription" name="metaDescription" defaultValue={product.metaDescription ?? ""} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="font-display text-h3 text-foreground">Listing filters</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="network">Network</Label>
            <FormSelect
              name="network"
              defaultValue={product.network ?? ""}
              placeholder="Not set"
              options={[
                { value: "", label: "Not set" },
                { value: "G4", label: "4G" },
                { value: "G5", label: "5G" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="displaySizeIn">Display size (inch)</Label>
            <Input
              id="displaySizeIn"
              name="displaySizeIn"
              type="number"
              step="0.1"
              defaultValue={product.displaySizeIn ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="batteryMah">Battery (mAh)</Label>
            <Input id="batteryMah" name="batteryMah" type="number" defaultValue={product.batteryMah ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="chipsetBrand">Chipset brand</Label>
            <Input id="chipsetBrand" name="chipsetBrand" defaultValue={product.chipsetBrand ?? ""} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="font-display text-h3 text-foreground">Spec values</h2>
        {specGroups.map((group) => (
          <div key={group.name} className="flex flex-col gap-3">
            <p className="font-semibold text-foreground">{group.name}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {group.attributes.map((attribute) => (
                <div key={attribute.id} className="flex flex-col gap-2">
                  <Label htmlFor={`spec-${attribute.id}`}>
                    {attribute.name}
                    {attribute.unit ? ` (${attribute.unit})` : ""}
                  </Label>
                  <Input
                    id={`spec-${attribute.id}`}
                    value={specValues[attribute.id] ?? ""}
                    onChange={(event) =>
                      setSpecValues((prev) => ({ ...prev, [attribute.id]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-h3 text-foreground">Colors and images</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>
            Add color
          </Button>
        </div>
        {colors.map((color, index) => (
          <ColorEditor
            key={color.id ?? `new-${index}`}
            productId={product.id}
            color={color}
            index={index}
            onChange={(next) => setColors((prev) => prev.map((row, rowIndex) => (rowIndex === index ? next : row)))}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-h3 text-foreground">Variants</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
            Add variant
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-body-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Color</th>
                <th className="p-2">RAM</th>
                <th className="p-2">Storage</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Price</th>
                <th className="p-2">Compare at</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Reserved</th>
                <th className="p-2">Warranty</th>
                <th className="p-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={variant.id ?? `v-${index}`} className="border-b border-border">
                  <td className="p-2">
                    <SelectField
                      value={variant.colorId}
                      onValueChange={(colorId) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) => (rowIndex === index ? { ...row, colorId } : row))
                        )
                      }
                      options={colorOptions.map((option) => ({ value: option.key, label: option.label }))}
                      triggerClassName="min-w-[120px]"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={variant.ramGb}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, ramGb: Number(event.target.value) } : row
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={variant.storageGb}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, storageGb: Number(event.target.value) } : row
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={variant.sku}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) => (rowIndex === index ? { ...row, sku: event.target.value } : row))
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, price: Number(event.target.value) } : row
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={variant.compareAtPrice ?? ""}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index
                              ? {
                                  ...row,
                                  compareAtPrice: event.target.value === "" ? null : Number(event.target.value),
                                }
                              : row
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, stock: Number(event.target.value) } : row
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2 text-muted-foreground">{variant.reservedStock}</td>
                  <td className="p-2">
                    <SelectField
                      value={variant.warrantyType}
                      onValueChange={(warrantyType) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index
                              ? { ...row, warrantyType: warrantyType as "OFFICIAL" | "UNOFFICIAL" }
                              : row
                          )
                        )
                      }
                      options={[
                        { value: "OFFICIAL", label: "Official" },
                        { value: "UNOFFICIAL", label: "Unofficial" },
                      ]}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(event) =>
                        setVariants((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, isActive: event.target.checked } : row
                          )
                        )
                      }
                      aria-label="Variant active"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {variants.length === 0 ? <p className="text-body-sm text-muted-foreground">Add at least one variant before saving.</p> : null}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save product"}
        </Button>
        <Link href={`/phones/${product.slug}`} className="text-body-sm text-link hover:underline">
          View on storefront
        </Link>
      </div>
    </form>
  )
}

const ColorEditor = ({
  productId,
  color,
  index,
  onChange,
}: {
  productId: string
  color: ColorRow
  index: number
  onChange: (color: ColorRow) => void
}) => {
  const [uploadState, setUploadState] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleUpload = (file: File) => {
    if (!color.id) {
      setUploadState("Save the product once before uploading images for a new color.")
      return
    }
    const formData = new FormData()
    formData.set("productId", productId)
    formData.set("colorId", color.id)
    formData.set("file", file)
    formData.set("sortOrder", String(color.images.length))
    formData.set("alt", `${color.name} image`)
    startTransition(async () => {
      const result = await uploadProductImageAction(formData)
      if (result?.error) setUploadState(result.error)
      else {
        setUploadState(null)
        window.location.reload()
      }
    })
  }

  const handleDeleteImage = (imageId: string) => {
    const formData = new FormData()
    formData.set("imageId", imageId)
    startTransition(async () => {
      await deleteProductImageAction(formData)
      window.location.reload()
    })
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>Name</Label>
          <Input
            value={color.name}
            onChange={(event) => onChange({ ...color, name: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Hex</Label>
          <Input value={color.hex} onChange={(event) => onChange({ ...color, hex: event.target.value })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Sort</Label>
          <Input
            type="number"
            value={color.sortOrder}
            onChange={(event) => onChange({ ...color, sortOrder: Number(event.target.value) })}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {color.images.map((image) => (
          <div key={image.id} className="flex flex-col items-center gap-1">
            <Image src={image.url} alt={image.alt} width={72} height={72} className="size-[72px] object-contain" unoptimized={image.url.endsWith(".svg")} />
            <button
              type="button"
              className="text-caption text-danger-text underline"
              onClick={() => handleDeleteImage(image.id)}
              disabled={pending}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Label htmlFor={`upload-${index}`}>Upload image</Label>
        <input
          id={`upload-${index}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) handleUpload(file)
          }}
        />
        {uploadState ? <p className="text-caption text-muted-foreground">{uploadState}</p> : null}
      </div>
    </div>
  )
}
