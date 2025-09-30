import {
  executeCommand,
  commandExists,
  hasRootPrivileges,
  executeSudoCommand,
} from './systemCommands'

describe('systemCommands', () => {
  describe('executeCommand', () => {
    it('should execute a simple command successfully', async () => {
      const result = await executeCommand('echo test')

      expect(result.stdout).toBe('test')
      expect(result.stderr).toBe('')
    })

    it('should execute command with output', async () => {
      const result = await executeCommand('echo hello world')

      expect(result.stdout).toContain('hello')
      expect(result.stdout).toContain('world')
    })

    it('should throw error for invalid command', async () => {
      await expect(executeCommand('nonexistentcommand12345')).rejects.toThrow(
        'Command failed'
      )
    })

    it('should throw error for command that exits with non-zero', async () => {
      // Use a command that works on both Windows and Linux
      await expect(executeCommand('node -e "process.exit(1)"')).rejects.toThrow(
        'Command failed'
      )
    })

    it('should timeout for long-running command', async () => {
      // Use node with setTimeout for cross-platform compatibility
      await expect(
        executeCommand('node -e "setTimeout(() => {}, 10000)"', 100)
      ).rejects.toThrow()
    }, 10000)

    it('should handle commands with output', async () => {
      const result = await executeCommand('node -v')

      expect(result.stdout).toBeTruthy()
      expect(result.stdout).toMatch(/v\d+\.\d+\.\d+/)
    })
  })

  describe('commandExists', () => {
    it('should return true for existing commands', async () => {
      // Use node which should exist since we're running tests with it
      const exists = await commandExists('node')

      expect(exists).toBe(true)
    })

    it('should return true for common system commands', async () => {
      // Use cross-platform commands
      const commands = ['node', 'npm']

      for (const cmd of commands) {
        const exists = await commandExists(cmd)
        expect(exists).toBe(true)
      }
    })

    it('should return false for nonexistent commands', async () => {
      const exists = await commandExists('nonexistentcommand12345')

      expect(exists).toBe(false)
    })
  })

  describe('hasRootPrivileges', () => {
    it('should return a boolean value', async () => {
      const hasRoot = await hasRootPrivileges()

      expect(typeof hasRoot).toBe('boolean')
    })

    it('should return false when running as non-root', async () => {
      // This test assumes we're not running as root
      const hasRoot = await hasRootPrivileges()

      // In development environment, typically not root
      expect(hasRoot).toBe(false)
    })
  })

  describe('executeSudoCommand', () => {
    it('should throw error when not running as root', async () => {
      // This test assumes we're not running as root
      await expect(executeSudoCommand('ls /')).rejects.toThrow(
        'This operation requires root privileges'
      )
    })

    it('should provide helpful error message', async () => {
      try {
        await executeSudoCommand('ls /')
      } catch (error) {
        expect((error as Error).message).toContain('root privileges')
        expect((error as Error).message).toContain('sudo')
      }
    })
  })
})