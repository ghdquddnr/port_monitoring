import type { Metadata } from 'next'
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
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}