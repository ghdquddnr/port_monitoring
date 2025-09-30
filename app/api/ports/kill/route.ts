import { NextRequest, NextResponse } from 'next/server'
import { killProcess } from '@/app/lib/ports'
import type { ProcessActionRequest, ProcessActionResponse } from '@/app/types/port'

/**
 * POST /api/ports/kill
 * Kill a process by PID
 */
export async function POST(request: NextRequest) {
  try {
    const body: ProcessActionRequest = await request.json()
    const { pid, port } = body

    // Validate input
    if (!pid || typeof pid !== 'number') {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid PID is required',
        } as ProcessActionResponse,
        { status: 400 }
      )
    }

    if (pid < 1) {
      return NextResponse.json(
        {
          success: false,
          message: 'PID must be a positive number',
        } as ProcessActionResponse,
        { status: 400 }
      )
    }

    // Kill the process
    await killProcess(pid)

    const response: ProcessActionResponse = {
      success: true,
      message: `Process ${pid} has been terminated`,
      pid,
      port,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message,
      } as ProcessActionResponse,
      { status: 500 }
    )
  }
}