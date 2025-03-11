"use client"

import "./globals.css"
import { Montserrat } from "next/font/google"
import { QueryClient, QueryClientProvider } from "react-query"
import Head from "next/head"

const inter = Montserrat({ subsets: ["latin"] })

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="scrollbar" lang="en">
      <head>
        <title>Monitor de Commits - Redeflex</title>
        <meta name="description" content="Acompanhe os commits do seu projeto em tempo real." />
        <meta property="og:title" content="Monitor de Commits - Redeflex" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  )
}
