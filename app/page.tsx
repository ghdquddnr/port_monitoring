'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from './components/LoadingSpinner'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/ports')

        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // User is not authenticated, redirect to login
          router.push('/login')
        }
      } catch {
        // On error, redirect to login
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}