import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface ExecResult {
  stdout: string
  stderr: string
}

export interface ExecError extends Error {
  code?: number
  killed?: boolean
  signal?: string
  cmd?: string
}

/**
 * Execute a system command asynchronously
 * @param command - The command to execute
 * @param timeout - Command timeout in milliseconds (default: 30000)
 * @returns Promise with stdout and stderr
 * @throws Error if command fails or times out
 */
export async function executeCommand(
  command: string,
  timeout: number = 30000
): Promise<ExecResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    })

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    }
  } catch (error) {
    const execError = error as ExecError
    throw new Error(
      `Command failed: ${command}\n` +
        `Exit code: ${execError.code || 'unknown'}\n` +
        `Error: ${execError.message}`
    )
  }
}

/**
 * Check if a command is available in the system
 * @param command - The command to check
 * @returns Promise<boolean> - true if command exists
 */
export async function commandExists(command: string): Promise<boolean> {
  try {
    await executeCommand(`which ${command}`)
    return true
  } catch {
    return false
  }
}

/**
 * Check if current process has root/sudo privileges
 * @returns Promise<boolean> - true if running with elevated privileges
 */
export async function hasRootPrivileges(): Promise<boolean> {
  try {
    const { stdout } = await executeCommand('id -u')
    return stdout === '0'
  } catch {
    return false
  }
}

/**
 * Execute a command that requires sudo privileges
 * @param command - The command to execute with sudo
 * @param timeout - Command timeout in milliseconds
 * @returns Promise with stdout and stderr
 */
export async function executeSudoCommand(
  command: string,
  timeout: number = 30000
): Promise<ExecResult> {
  const hasRoot = await hasRootPrivileges()

  if (!hasRoot) {
    throw new Error(
      'This operation requires root privileges. Please run with sudo or as root.'
    )
  }

  return executeCommand(command, timeout)
}