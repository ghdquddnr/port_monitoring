'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import SearchBar from '@/app/components/SearchBar'
import RefreshControl from '@/app/components/RefreshControl'
import PortTable from '@/app/components/PortTable'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import Toast, { ToastType } from '@/app/components/Toast'
import type { PortInfo, Protocol, PortListResponse } from '@/app/types/port'

interface ToastMessage {
  message: string
  type: ToastType
  id: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [filteredPorts, setFilteredPorts] = useState<PortInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [protocolFilter, setProtocolFilter] = useState<Protocol | 'all'>('all')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Fetch ports data
  const fetchPorts = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/ports')

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch ports')
      }

      const data: PortListResponse = await response.json()
      setPorts(data.ports)
    } catch (error) {
      showToast('포트 정보를 가져오는데 실패했습니다', 'error')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchPorts()
  }, [])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchPorts()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Filter ports
  useEffect(() => {
    let filtered = ports

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (port) =>
          port.port.toString().includes(query) ||
          port.process.name.toLowerCase().includes(query) ||
          port.process.pid.toString().includes(query) ||
          port.process.serviceName?.toLowerCase().includes(query)
      )
    }

    // Protocol filter
    if (protocolFilter !== 'all') {
      filtered = filtered.filter((port) => port.protocol === protocolFilter)
    }

    setFilteredPorts(filtered)
  }, [ports, searchQuery, protocolFilter])

  // Toast notifications
  const showToast = (message: string, type: ToastType) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { message, type, id }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Port actions
  const handleKillProcess = async (pid: number, port: number) => {
    try {
      const response = await fetch('/api/ports/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, port }),
      })

      const data = await response.json()

      if (data.success) {
        showToast(`프로세스 ${pid}가 종료되었습니다`, 'success')
        await fetchPorts()
      } else {
        showToast(data.message || '프로세스 종료에 실패했습니다', 'error')
      }
    } catch (error) {
      showToast('프로세스 종료 중 오류가 발생했습니다', 'error')
    }
  }

  const handleRestartService = async (serviceName: string, port: number) => {
    try {
      const response = await fetch('/api/ports/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName, port }),
      })

      const data = await response.json()

      if (data.success) {
        showToast(`서비스 ${serviceName}가 재시작되었습니다`, 'success')
        await fetchPorts()
      } else {
        showToast(data.message || '서비스 재시작에 실패했습니다', 'error')
      }
    } catch (error) {
      showToast('서비스 재시작 중 오류가 발생했습니다', 'error')
    }
  }

  const handleBlockPort = async (port: number, protocol: string) => {
    try {
      const response = await fetch('/api/ports/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port, protocol }),
      })

      const data = await response.json()

      if (data.success) {
        showToast(`포트 ${port}가 차단되었습니다`, 'success')
        await fetchPorts()
      } else {
        showToast(data.message || '포트 차단에 실패했습니다', 'error')
      }
    } catch (error) {
      showToast('포트 차단 중 오류가 발생했습니다', 'error')
    }
  }

  const handleUnblockPort = async (port: number, protocol: string) => {
    try {
      const response = await fetch('/api/ports/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port, protocol }),
      })

      const data = await response.json()

      if (data.success) {
        showToast(`포트 ${port}의 차단이 해제되었습니다`, 'success')
        await fetchPorts()
      } else {
        showToast(data.message || '포트 차단 해제에 실패했습니다', 'error')
      }
    } catch (error) {
      showToast('포트 차단 해제 중 오류가 발생했습니다', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              총 포트
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {ports.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              차단된 포트
            </div>
            <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
              {ports.filter((p) => p.isBlocked).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              검색 결과
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {filteredPorts.length}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SearchBar
              onSearch={setSearchQuery}
              onProtocolFilter={setProtocolFilter}
            />
            <RefreshControl
              onRefresh={fetchPorts}
              isRefreshing={isRefreshing}
              autoRefresh={autoRefresh}
              onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
            />
          </div>
        </div>

        {/* Port Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <PortTable
            ports={filteredPorts}
            onKillProcess={handleKillProcess}
            onRestartService={handleRestartService}
            onBlockPort={handleBlockPort}
            onUnblockPort={handleUnblockPort}
          />
        </div>
      </main>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}