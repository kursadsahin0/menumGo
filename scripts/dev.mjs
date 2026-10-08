import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const children = []

function run(args) {
  const child = spawn('npm', args, {
    cwd: root,
    stdio: 'inherit',
    detached: true,
  })
  children.push(child)
  return child
}

function stop() {
  for (const child of children) {
    if (child.pid && !child.killed) {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch {
        child.kill('SIGTERM')
      }
    }
  }
}

function waitForApi() {
  const started = Date.now()

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect(3000, '127.0.0.1')

      socket.once('connect', () => {
        socket.end()
        resolve()
      })

      socket.once('error', () => {
        socket.destroy()

        if (Date.now() - started > 20_000) {
          reject(new Error('API 3000 portunda açılmadı.'))
          return
        }

        setTimeout(attempt, 200)
      })
    }

    attempt()
  })
}

const api = run(['run', 'api'])

api.on('exit', (code) => {
  if (code) {
    stop()
    process.exit(code)
  }
})

process.on('SIGINT', () => {
  stop()
  process.exit(0)
})
process.on('SIGTERM', () => {
  stop()
  process.exit(0)
})

try {
  await waitForApi()
} catch (error) {
  console.error(error.message)
  stop()
  process.exit(1)
}

const ui = run(['run', 'dev:ui'])

ui.on('exit', (code) => {
  stop()
  process.exit(code ?? 0)
})
