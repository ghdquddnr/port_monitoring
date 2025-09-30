import type { Metadata } from 'next'
import { ThemeProvider } from '@/app/context/ThemeContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Port Monitoring',
  description: 'Ubuntu Server Port Monitoring and Management Tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}