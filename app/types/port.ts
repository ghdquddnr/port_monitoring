/**
 * Port and process information types
 */

export type ConnectionState =
  | 'LISTEN'
  | 'ESTABLISHED'
  | 'TIME_WAIT'
  | 'CLOSE_WAIT'
  | 'SYN_SENT'
  | 'SYN_RECV'
  | 'FIN_WAIT1'
  | 'FIN_WAIT2'
  | 'CLOSING'
  | 'LAST_ACK'
  | 'CLOSED'

export type Protocol = 'tcp' | 'tcp6' | 'udp' | 'udp6'

export interface ProcessInfo {
  pid: number
  name: string
  command: string
  isSystemdService: boolean
  serviceName?: string
}

export interface PortInfo {
  port: number
  protocol: Protocol
  state: ConnectionState
  localAddress: string
  remoteAddress?: string
  process: ProcessInfo
  connections: number
  isBlocked: boolean
}

export interface PortListResponse {
  ports: PortInfo[]
  timestamp: number
  totalPorts: number
}

export interface ProcessActionRequest {
  pid: number
  port: number
}

export interface ProcessActionResponse {
  success: boolean
  message: string
  port?: number
  pid?: number
}

export interface ServiceRestartRequest {
  serviceName: string
  port: number
}

export interface ServiceRestartResponse {
  success: boolean
  message: string
  serviceName?: string
}

export interface PortBlockRequest {
  port: number
  protocol: Protocol
}

export interface PortBlockResponse {
  success: boolean
  message: string
  port?: number
  protocol?: Protocol
  isBlocked?: boolean
}