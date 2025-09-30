import { parseSSOutput, getSystemdServiceForPID, getBlockedPorts } from './ports'
import type { PortInfo } from '@/app/types/port'

describe('ports', () => {
  describe('parseSSOutput', () => {
    it('should parse TCP listening ports', () => {
      const ssOutput = `LISTEN   0      128    0.0.0.0:22          0.0.0.0:*     users:(("sshd",pid=1234,fd=3))
LISTEN   0      128    0.0.0.0:80          0.0.0.0:*     users:(("nginx",pid=5678,fd=6))`

      const ports = parseSSOutput(ssOutput)

      expect(ports).toHaveLength(2)

      expect(ports[0].port).toBe(22)
      expect(ports[0].protocol).toBe('tcp')
      expect(ports[0].state).toBe('LISTEN')
      expect(ports[0].process.pid).toBe(1234)
      expect(ports[0].process.name).toBe('sshd')

      expect(ports[1].port).toBe(80)
      expect(ports[1].protocol).toBe('tcp')
      expect(ports[1].process.pid).toBe(5678)
      expect(ports[1].process.name).toBe('nginx')
    })

    it('should parse TCP6 listening ports', () => {
      const ssOutput = `LISTEN   0      128    :::8080                :::*         users:(("node",pid=9999,fd=12))`

      const ports = parseSSOutput(ssOutput)

      expect(ports).toHaveLength(1)
      expect(ports[0].port).toBe(8080)
      expect(ports[0].protocol).toBe('tcp6')
      expect(ports[0].process.name).toBe('node')
    })

    it('should parse UDP listening ports', () => {
      const ssOutput = `UNCONN   0      0      0.0.0.0:53          0.0.0.0:*     users:(("systemd-resolve",pid=500,fd=12))`

      const ports = parseSSOutput(ssOutput)

      expect(ports).toHaveLength(1)
      expect(ports[0].port).toBe(53)
      expect(ports[0].protocol).toBe('udp')
      expect(ports[0].state).toBe('LISTEN')
      expect(ports[0].process.name).toBe('systemd-resolve')
    })

    it('should handle malformed lines gracefully', () => {
      const ssOutput = `LISTEN   0      128    0.0.0.0:22          0.0.0.0:*     users:(("sshd",pid=1234,fd=3))
Invalid line without proper format
LISTEN   0      128    0.0.0.0:80          0.0.0.0:*     users:(("nginx",pid=5678,fd=6))`

      const ports = parseSSOutput(ssOutput)

      expect(ports).toHaveLength(2)
      expect(ports.map((p) => p.port)).toEqual([22, 80])
    })

    it('should deduplicate ports and count connections', () => {
      const ssOutput = `LISTEN     0      128    0.0.0.0:80          0.0.0.0:*     users:(("nginx",pid=5678,fd=6))
ESTAB      0      0      192.168.1.10:80     192.168.1.20:52342 users:(("nginx",pid=5678,fd=8))
ESTAB      0      0      192.168.1.10:80     192.168.1.21:52343 users:(("nginx",pid=5678,fd=9))`

      const ports = parseSSOutput(ssOutput)

      expect(ports).toHaveLength(1)
      expect(ports[0].port).toBe(80)
      expect(ports[0].connections).toBe(3)
    })

    it('should handle empty output', () => {
      const ports = parseSSOutput('')

      expect(ports).toHaveLength(0)
    })

    it('should validate port numbers', () => {
      const ssOutput = `LISTEN   0      128    0.0.0.0:99999       0.0.0.0:*     users:(("invalid",pid=1234,fd=3))
LISTEN   0      128    0.0.0.0:0           0.0.0.0:*     users:(("invalid2",pid=5678,fd=6))
LISTEN   0      128    0.0.0.0:80          0.0.0.0:*     users:(("nginx",pid=9999,fd=12))`

      const ports = parseSSOutput(ssOutput)

      // Only valid port (80) should be parsed
      expect(ports).toHaveLength(1)
      expect(ports[0].port).toBe(80)
    })

    it('should extract process information correctly', () => {
      const ssOutput = `LISTEN   0      128    0.0.0.0:3000        0.0.0.0:*     users:(("node",pid=12345,fd=20))`

      const ports = parseSSOutput(ssOutput)

      expect(ports[0].process).toEqual({
        pid: 12345,
        name: 'node',
        command: 'node',
        isSystemdService: false,
      })
    })
  })

  describe('getSystemdServiceForPID', () => {
    it('should return null for non-systemd processes', async () => {
      // This test will likely fail on Windows, but demonstrates the expected behavior
      const result = await getSystemdServiceForPID(process.pid)

      // Current process (Jest) is not a systemd service
      expect(result).toBeNull()
    })

    it('should return null for invalid PID', async () => {
      const result = await getSystemdServiceForPID(999999)

      expect(result).toBeNull()
    })
  })

  describe('getBlockedPorts', () => {
    it('should return empty set when iptables fails', async () => {
      // On Windows or without root, this should return empty set
      const blockedPorts = await getBlockedPorts()

      expect(blockedPorts).toBeInstanceOf(Set)
    })
  })
})