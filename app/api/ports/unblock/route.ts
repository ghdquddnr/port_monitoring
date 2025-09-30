import { NextRequest, NextResponse } from 'next/server'
import { unblockPort } from '@/app/lib/ports'
import type { PortBlockRequest, PortBlockResponse, Protocol } from '@/app/types/port'

/**
 * POST /api/ports/unblock
 * Unblock a port by removing iptables rule
 */
export async function POST(request: NextRequest) {
  try {
    const body: PortBlockRequest = await request.json()
    const { port, protocol } = body

    // Validate port
    if (!port || typeof port !== 'number') {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid port number is required',
        } as PortBlockResponse,
        { status: 400 }
      )
    }

    if (port < 1 || port > 65535) {
      return NextResponse.json(
        {
          success: false,
          message: 'Port must be between 1 and 65535',
        } as PortBlockResponse,
        { status: 400 }
      )
    }

    // Validate protocol
    const validProtocols: Protocol[] = ['tcp', 'tcp6', 'udp', 'udp6']
    if (!protocol || !validProtocols.includes(protocol)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid protocol is required (tcp, tcp6, udp, udp6)',
        } as PortBlockResponse,
        { status: 400 }
      )
    }

    // Unblock the port
    await unblockPort(port, protocol)

    const response: PortBlockResponse = {
      success: true,
      message: `Port ${port} (${protocol}) has been unblocked`,
      port,
      protocol,
      isBlocked: false,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message,
      } as PortBlockResponse,
      { status: 500 }
    )
  }
}