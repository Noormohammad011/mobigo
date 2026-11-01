import type { OrderStatus } from "@/generated/prisma/client"

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
}

const statusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
}

export const allowedNextStatuses = (from: OrderStatus): OrderStatus[] => ALLOWED[from]

export const orderStatusLabel = (status: OrderStatus) => statusLabel[status]

export const isAllowedOrderTransition = (from: OrderStatus, to: OrderStatus) => ALLOWED[from].includes(to)

export const orderStatusesThatHoldReservation: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED"]
