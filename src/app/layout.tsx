import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shadowdark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="top-nav">
          <Link href="/">Home</Link>
          <Link href="/pages/shadowdark">Shadowdark</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
