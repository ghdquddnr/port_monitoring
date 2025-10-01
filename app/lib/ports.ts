import { executeCommand, executeSudoCommand } from './systemCommands'
import type {
  PortInfo,
  ProcessInfo,
  Protocol,
  ConnectionState,
} from '@/app/types/port'

/**
 * Parse ss command output to extract port information
 * @param output - Raw ss command output
 * @returns Array of PortInfo objects
 */
export function parseSSOutput(output: string): PortInfo[] {
  const lines = output.split('\n').filter((line) => line.trim())
  const ports: PortInfo[] = []
  const seenPorts = new Set<string>()

  for (const line of lines) {
    try {
      // Skip header line
      if (line.includes('State') && line.includes('Recv-Q')) continue

      // ss output format: Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port [Process]
      // Process field is optional (may not be present in Docker containers)
      const parts = line.trim().split(/\s+/)
      if (parts.length < 6) continue

      const netid = parts[0] // tcp/udp/tcp6/udp6
      const state = parts[1] as ConnectionState
      const localAddr = parts[4]
      const remoteAddr = parts[5] || ''
      const processInfo = parts.slice(6).join(' ')

      // Extract port and address
      // Handle IPv4 (0.0.0.0:80) and IPv6 (:::80 or ::1:80)
      let port: number
      let address: string

      if (localAddr.startsWith(':::')) {
        // IPv6 format: :::port
        const portStr = localAddr.substring(3)
        port = parseInt(portStr)
        address = '::'
      } else {
        // IPv4 or other IPv6 format
        const lastColonIndex = localAddr.lastIndexOf(':')
        if (lastColonIndex === -1) continue

        address = localAddr.substring(0, lastColonIndex)
        const portStr = localAddr.substring(lastColonIndex + 1)
        port = parseInt(portStr)
      }

      if (isNaN(port) || port < 1 || port > 65535) continue

      // Determine protocol from address format
      let protocol: Protocol = 'tcp'
      const isIPv6 = address.includes(':') || address === '::'
      const isUDP = state === 'UNCONN'

      if (isIPv6) {
        protocol = isUDP ? 'udp6' : 'tcp6'
      } else {
        protocol = isUDP ? 'udp' : 'tcp'
      }

      // Parse process information: users:(("process",pid=1234,fd=5))
      const processMatch = processInfo.match(/users:\(\("([^"]+)",pid=(\d+)/)

      let processName = 'Unknown'
      let pid = 0

      if (processMatch) {
        processName = processMatch[1]
        pid = parseInt(processMatch[2])
      }

      // Create unique key for port deduplication
      const portKey = `${protocol}:${port}`

      if (!seenPorts.has(portKey)) {
        seenPorts.add(portKey)

        const process: ProcessInfo = {
          pid,
          name: processName,
          command: processName,
          isSystemdService: false, // Will be populated later
        }

        const portInfo: PortInfo = {
          port,
          protocol,
          state: state === 'UNCONN' ? 'LISTEN' : state,
          localAddress: address,
          remoteAddress: remoteAddr || undefined,
          process,
          connections: 1,
          isBlocked: false, // Will be populated later
        }

        ports.push(portInfo)
      } else {
        // Increment connection count for existing port
        const existingPort = ports.find(
          (p) => p.protocol === protocol && p.port === port
        )
        if (existingPort) {
          existingPort.connections++
        }
      }
    } catch (error) {
      // Skip malformed lines
      continue
    }
  }

  return ports
}

/**
 * Get all listening ports using ss command
 * @returns Promise<PortInfo[]> - Array of port information
 */
export async function getListeningPorts(): Promise<PortInfo[]> {
  try {
    // Use ss command with -tulpn flags:
    // -t: TCP sockets
    // -u: UDP sockets
    // -l: Listening sockets only
    // -p: Show process information
    // -n: Don't resolve service names
    const { stdout } = await executeSudoCommand('ss -tulpn')

    const ports = parseSSOutput(stdout)

    // Enrich with systemd service information
    for (const portInfo of ports) {
      const serviceInfo = await getSystemdServiceForPID(portInfo.process.pid)
      if (serviceInfo) {
        portInfo.process.isSystemdService = true
        portInfo.process.serviceName = serviceInfo.serviceName
        portInfo.process.command = serviceInfo.command
      }
    }

    // Check blocked status for all ports
    const blockedPorts = await getBlockedPorts()
    for (const portInfo of ports) {
      const blockedKey = `${portInfo.protocol}:${portInfo.port}`
      portInfo.isBlocked = blockedPorts.has(blockedKey)
    }

    return ports
  } catch (error) {
    throw new Error(`Failed to get listening ports: ${(error as Error).message}`)
  }
}

/**
 * Check if a process is managed by systemd
 * @param pid - Process ID
 * @returns Promise with systemd service information or null
 */
export async function getSystemdServiceForPID(
  pid: number
): Promise<{ serviceName: string; command: string } | null> {
  try {
    // Get cgroup information for the process
    const { stdout } = await executeCommand(`cat /proc/${pid}/cgroup`)

    // Look for systemd service name in cgroup
    const serviceMatch = stdout.match(/\/system\.slice\/([^\/\s]+)\.service/)
    if (!serviceMatch) return null

    const serviceName = serviceMatch[1]

    // Get full command line
    try {
      const { stdout: cmdline } = await executeCommand(`cat /proc/${pid}/cmdline`)
      const command = cmdline.replace(/\0/g, ' ').trim()

      return {
        serviceName,
        command: command || serviceName,
      }
    } catch {
      return {
        serviceName,
        command: serviceName,
      }
    }
  } catch {
    return null
  }
}

/**
 * Get all blocked ports from iptables
 * @returns Promise<Set<string>> - Set of blocked ports in format "protocol:port"
 */
export async function getBlockedPorts(): Promise<Set<string>> {
  const blockedPorts = new Set<string>()

  try {
    // Check iptables INPUT chain for DROP rules
    const { stdout } = await executeSudoCommand('iptables -L INPUT -n --line-numbers')

    const lines = stdout.split('\n')
    for (const line of lines) {
      if (line.includes('DROP') && line.includes('dpt:')) {
        // Extract port from rule like: "DROP tcp -- 0.0.0.0/0 0.0.0.0/0 tcp dpt:8080"
        const portMatch = line.match(/dpt:(\d+)/)
        const protocolMatch = line.match(/^\d+\s+\w+\s+(\w+)/)

        if (portMatch && protocolMatch) {
          const port = portMatch[1]
          const protocol = protocolMatch[1].toLowerCase()
          blockedPorts.add(`${protocol}:${port}`)
        }
      }
    }
  } catch (error) {
    // If iptables command fails, return empty set (no blocked ports)
    console.error('Failed to check iptables:', (error as Error).message)
  }

  return blockedPorts
}

/**
 * Block a port using iptables
 * @param port - Port number to block
 * @param protocol - Protocol (tcp/udp)
 * @returns Promise<void>
 */
export async function blockPort(port: number, protocol: Protocol): Promise<void> {
  try {
    const baseProtocol = protocol.replace(/6$/, '') // tcp6 -> tcp, udp6 -> udp
    await executeSudoCommand(
      `iptables -A INPUT -p ${baseProtocol} --dport ${port} -j DROP`
    )
  } catch (error) {
    throw new Error(
      `Failed to block port ${port}: ${(error as Error).message}`
    )
  }
}

/**
 * Unblock a port using iptables
 * @param port - Port number to unblock
 * @param protocol - Protocol (tcp/udp)
 * @returns Promise<void>
 */
export async function unblockPort(port: number, protocol: Protocol): Promise<void> {
  try {
    const baseProtocol = protocol.replace(/6$/, '') // tcp6 -> tcp, udp6 -> udp

    // Find the rule number
    const { stdout } = await executeSudoCommand(
      `iptables -L INPUT -n --line-numbers`
    )

    const lines = stdout.split('\n')
    for (const line of lines) {
      if (line.includes(`dpt:${port}`) && line.includes(baseProtocol)) {
        const ruleMatch = line.match(/^(\d+)/)
        if (ruleMatch) {
          const ruleNumber = ruleMatch[1]
          await executeSudoCommand(`iptables -D INPUT ${ruleNumber}`)
          return
        }
      }
    }

    throw new Error(`No iptables rule found for ${baseProtocol}:${port}`)
  } catch (error) {
    throw new Error(
      `Failed to unblock port ${port}: ${(error as Error).message}`
    )
  }
}

/**
 * Kill a process by PID
 * @param pid - Process ID
 * @returns Promise<void>
 */
export async function killProcess(pid: number): Promise<void> {
  try {
    await executeSudoCommand(`kill -9 ${pid}`)
  } catch (error) {
    throw new Error(
      `Failed to kill process ${pid}: ${(error as Error).message}`
    )
  }
}

/**
 * Restart a systemd service
 * @param serviceName - Systemd service name
 * @returns Promise<void>
 */
export async function restartService(serviceName: string): Promise<void> {
  try {
    await executeSudoCommand(`systemctl restart ${serviceName}`)
  } catch (error) {
    throw new Error(
      `Failed to restart service ${serviceName}: ${(error as Error).message}`
    )
  }
}