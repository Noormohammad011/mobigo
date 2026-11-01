"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

export type FormSelectOption = { value: string; label: string }

const EMPTY_VALUE = "__mobigo_empty__"

function toInternalValue(value: string) {
  return value === "" ? EMPTY_VALUE : value
}

function toFormValue(value: string) {
  return value === EMPTY_VALUE ? "" : value
}

/** Styled select for HTML forms: syncs choice to a hidden `<input name={…}>`. */
export function FormSelect({
  name,
  defaultValue = "",
  options,
  placeholder = "Select…",
  className,
  triggerClassName,
  "aria-label": ariaLabel,
  required,
  disabled,
  value: controlledValue,
  onValueChange,
}: {
  name: string
  defaultValue?: string
  options: FormSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  "aria-label"?: string
  required?: boolean
  disabled?: boolean
  /** Controlled mode (still submits via hidden input). */
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [internal, setInternal] = useState(toInternalValue(defaultValue))
  const value = controlledValue !== undefined ? toInternalValue(controlledValue) : internal

  const handleChange = (next: string | null) => {
    const internalNext = next ?? EMPTY_VALUE
    if (controlledValue === undefined) setInternal(internalNext)
    onValueChange?.(toFormValue(internalNext))
  }

  const items = options.map((o) => ({
    value: toInternalValue(o.value),
    label: o.label,
  }))

  return (
    <div className={cn("relative w-full", className)}>
      <input type="hidden" name={name} value={toFormValue(value)} required={required && toFormValue(value) === ""} />
      <Select items={items} value={value} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger className={cn("w-full", triggerClassName)} aria-label={ariaLabel}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={6}>
          {options.map((option) => (
            <SelectItem key={option.value || EMPTY_VALUE} value={toInternalValue(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Controlled select (no form field) — same menu styling as FormSelect. */
export function SelectField({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  triggerClassName,
  "aria-label": ariaLabel,
  disabled,
}: {
  value: string
  onValueChange: (value: string) => void
  options: FormSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  "aria-label"?: string
  disabled?: boolean
}) {
  const internal = toInternalValue(value)
  const items = options.map((o) => ({
    value: toInternalValue(o.value),
    label: o.label,
  }))

  return (
    <div className={cn("relative w-full", className)}>
      <Select
        items={items}
        value={internal}
        onValueChange={(next) => onValueChange(toFormValue(next ?? EMPTY_VALUE))}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full", triggerClassName)} aria-label={ariaLabel}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={6}>
          {options.map((option) => (
            <SelectItem key={option.value || EMPTY_VALUE} value={toInternalValue(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
