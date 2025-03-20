"use client"

import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}