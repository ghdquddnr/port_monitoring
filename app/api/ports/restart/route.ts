import { NextRequest, NextResponse } from 'next/server'
import { restartService } from '@/app/lib/ports'
import type { ServiceRestartRequest, ServiceRestartResponse } from '@/app/types/port'

/**
 * POST /api/ports/restart
 * Restart a systemd service
 */
export async function POST(request: NextRequest) {
  try {
    const body: ServiceRestartRequest = await request.json()
    const { serviceName, port } = body

    // Validate input
    if (!serviceName || typeof serviceName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid service name is required',
        } as ServiceRestartResponse,
        { status: 400 }
      )
    }

    // Basic service name validation (alphanumeric, dash, underscore, dot)
    if (!/^[a-zA-Z0-9._-]+$/.test(serviceName)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid service name format',
        } as ServiceRestartResponse,
        { status: 400 }
      )
    }

    // Restart the service
    await restartService(serviceName)

    const response: ServiceRestartResponse = {
      success: true,
      message: `Service ${serviceName} has been restarted`,
      serviceName,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message,
      } as ServiceRestartResponse,
      { status: 500 }
    )
  }
}