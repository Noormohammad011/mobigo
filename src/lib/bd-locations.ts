/** Bangladesh divisions and districts for checkout (PRD CO-1). Districts must match seed DeliveryZoneDistrict rows. */
export const BD_DIVISIONS = [
  { name: "Dhaka", districts: ["Dhaka", "Gazipur", "Narayanganj", "Savar"] },
  { name: "Chattogram", districts: ["Chattogram", "Cumilla"] },
  { name: "Sylhet", districts: ["Sylhet"] },
  { name: "Rajshahi", districts: ["Rajshahi"] },
  { name: "Khulna", districts: ["Khulna"] },
  { name: "Barishal", districts: ["Barishal"] },
  { name: "Rangpur", districts: ["Rangpur"] },
  { name: "Mymensingh", districts: ["Mymensingh"] },
] as const

export const allDistricts = BD_DIVISIONS.flatMap((d) => d.districts)

export const divisionForDistrict = (district: string): string | null => {
  for (const row of BD_DIVISIONS) {
    if ((row.districts as readonly string[]).includes(district)) return row.name
  }
  return null
}
