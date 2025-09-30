'use client'

import { useState } from 'react'
import type { PortInfo } from '@/app/types/port'
import ConfirmDialog from './ConfirmDialog'

interface PortTableProps {
  ports: PortInfo[]
  onKillProcess: (pid: number, port: number) => Promise<void>
  onRestartService: (serviceName: string, port: number) => Promise<void>
  onBlockPort: (port: number, protocol: string) => Promise<void>
  onUnblockPort: (port: number, protocol: string) => Promise<void>
}

type ActionType = 'kill' | 'restart' | 'block' | 'unblock'

interface ConfirmAction {
  type: ActionType
  portInfo: PortInfo
}

export default function PortTable({
  ports,
  onKillProcess,
  onRestartService,
  onBlockPort,
  onUnblockPort,
}: PortTableProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  const handleAction = async (action: ActionType, portInfo: PortInfo) => {
    setConfirmAction({ type: action, portInfo })
  }

  const executeAction = async () => {
    if (!confirmAction) return

    const { type, portInfo } = confirmAction
    const loadingKey = `${type}-${portInfo.port}-${portInfo.process.pid}`

    setLoading((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      switch (type) {
        case 'kill':
          await onKillProcess(portInfo.process.pid, portInfo.port)
          break
        case 'restart':
          if (portInfo.process.serviceName) {
            await onRestartService(portInfo.process.serviceName, portInfo.port)
          }
          break
        case 'block':
          await onBlockPort(portInfo.port, portInfo.protocol)
          break
        case 'unblock':
          await onUnblockPort(portInfo.port, portInfo.protocol)
          break
      }
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }))
      setConfirmAction(null)
    }
  }

  const getConfirmDialogProps = () => {
    if (!confirmAction) return null

    const { type, portInfo } = confirmAction

    switch (type) {
      case 'kill':
        return {
          title: '프로세스 종료',
          message: `프로세스 ${portInfo.process.name} (PID: ${portInfo.process.pid})를 종료하시겠습니까?`,
          confirmText: '종료',
        }
      case 'restart':
        return {
          title: '서비스 재시작',
          message: `서비스 ${portInfo.process.serviceName}를 재시작하시겠습니까?`,
          confirmText: '재시작',
          confirmButtonClass:
            'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
        }
      case 'block':
        return {
          title: '포트 차단',
          message: `포트 ${portInfo.port} (${portInfo.protocol})를 차단하시겠습니까?`,
          confirmText: '차단',
          confirmButtonClass:
            'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800',
        }
      case 'unblock':
        return {
          title: '포트 차단 해제',
          message: `포트 ${portInfo.port} (${portInfo.protocol})의 차단을 해제하시겠습니까?`,
          confirmText: '해제',
          confirmButtonClass:
            'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
        }
    }
  }

  if (ports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        표시할 포트가 없습니다.
      </div>
    )
  }

  const dialogProps = getConfirmDialogProps()

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                포트
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                프로토콜
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                프로세스
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                연결
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                차단
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {ports.map((port, index) => (
              <tr
                key={`${port.port}-${port.protocol}-${index}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {port.port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {port.protocol.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    {port.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {port.process.name}
                  </div>
                  {port.process.isSystemdService && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {port.process.serviceName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {port.process.pid}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {port.connections}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {port.isBlocked ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      차단됨
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      허용
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {/* Kill Process */}
                    <button
                      onClick={() => handleAction('kill', port)}
                      disabled={loading[`kill-${port.port}-${port.process.pid}`]}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      title="프로세스 종료"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    {/* Restart Service */}
                    {port.process.isSystemdService && (
                      <button
                        onClick={() => handleAction('restart', port)}
                        disabled={loading[`restart-${port.port}-${port.process.pid}`]}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                        title="서비스 재시작"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Block/Unblock Port */}
                    {port.isBlocked ? (
                      <button
                        onClick={() => handleAction('unblock', port)}
                        disabled={loading[`unblock-${port.port}-${port.process.pid}`]}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                        title="포트 차단 해제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('block', port)}
                        disabled={loading[`block-${port.port}-${port.process.pid}`]}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50"
                        title="포트 차단"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      {dialogProps && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          title={dialogProps.title}
          message={dialogProps.message}
          confirmText={dialogProps.confirmText}
          confirmButtonClass={dialogProps.confirmButtonClass}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  )
}