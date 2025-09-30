import { NextResponse } from 'next/server'
import { getListeningPorts } from '@/app/lib/ports'
import type { PortListResponse } from '@/app/types/port'

/**
 * GET /api/ports
 * Get all listening ports with process and block status information
 */
export async function GET() {
  try {
    const ports = await getListeningPorts()

    const response: PortListResponse = {
      ports,
      timestamp: Date.now(),
      totalPorts: ports.length,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get listening ports',
        message: (error as Error).message,
      },
      { status: 500 }
    )
  }
}