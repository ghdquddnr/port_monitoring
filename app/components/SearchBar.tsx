'use client'

import { useState } from 'react'
import type { Protocol } from '@/app/types/port'

interface SearchBarProps {
  onSearch: (query: string) => void
  onProtocolFilter: (protocol: Protocol | 'all') => void
}

export default function SearchBar({ onSearch, onProtocolFilter }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | 'all'>('all')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const handleProtocolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const protocol = e.target.value as Protocol | 'all'
    setSelectedProtocol(protocol)
    onProtocolFilter(protocol)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="포트, 프로세스, PID로 검색..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Protocol Filter */}
      <div className="sm:w-48">
        <select
          value={selectedProtocol}
          onChange={handleProtocolChange}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">모든 프로토콜</option>
          <option value="tcp">TCP</option>
          <option value="tcp6">TCP6</option>
          <option value="udp">UDP</option>
          <option value="udp6">UDP6</option>
        </select>
      </div>
    </div>
  )
}