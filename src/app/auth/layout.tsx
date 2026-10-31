import type { Metadata } from "next";

// Auth pages carry no search value; keep them out of the index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return children;
}
