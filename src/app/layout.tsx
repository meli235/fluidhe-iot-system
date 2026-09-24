import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FluidHE - Dashboard Heat Exchanger UAD",
  description: "Heat Exchanger IoT Control System - Universitas Ahmad Dahlan",
  icons: {
    icon: "/uad-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F4F7FE] text-[#1B2559]">
        {children}
      </body>
    </html>
  );
}
