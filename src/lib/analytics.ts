/**
 * Store events with no personal data. There is no provider yet, so nothing leaves the server.
 * The owed choice (which dashboard receives these) is recorded in spec 0004.
 */
export type AnalyticsEvent =
  | { name: "page_view"; path: string }
  | { name: "product_view"; productId: string; slug: string }
  | { name: "add_to_cart"; variantId: string; quantity: number }
  | { name: "checkout_start"; itemCount: number }
  | { name: "order_placed"; orderNumber: string }
  | { name: "compare_add"; productId: string }

export const track = (event: AnalyticsEvent): void => {
  void event
}
