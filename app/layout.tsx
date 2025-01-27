"use client"

import "./globals.css"
import { Montserrat  } from "next/font/google"
import { QueryClient, QueryClientProvider } from "react-query"

const inter = Montserrat ({ subsets: ["latin"] })

const queryClient = new QueryClient()


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  )
}

