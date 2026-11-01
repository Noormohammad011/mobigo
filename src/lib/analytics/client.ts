"use client"

/** Client side mirror of server analytics (spec 0004). No provider yet. */
export type ClientAnalyticsEvent =
  | { name: "compare_add"; productId: string }

export const trackClient = (event: ClientAnalyticsEvent): void => {
  void event
}
