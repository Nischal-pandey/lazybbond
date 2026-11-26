import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LazyBond — Make plans happen",
  description:
    "Find people who are up for the same things. Discover nearby plans, meet your people, and make the good stuff happen.",
  applicationName: "LazyBond",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  alternates: process.env.NEXT_PUBLIC_SITE_URL ? { canonical: "/" } : undefined,
  openGraph: {
    title: "LazyBond — Make plans happen",
    description:
      "Post a plan, join one nearby, and meet people who are actually up for it.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
