const express = require('express')
const Docker = require('dockerode')
const { v4: uuidv4 } = require('uuid')

const app = express()
const docker = new Docker()

app.use(express.json())

// Store active sessions in memory
const sessions = {}

// ─── CREATE SESSION ───────────────────────────────────────
app.post('/api/session/create', async (req, res) => {
  try {
    const sessionId = uuidv4()   // unique ID e.g. "a1b2-c3d4-..."

    // Spin up a new container
    const container = await docker.createContainer({
      Image: 'disposable-browser:v1',
      ExposedPorts: { '6080/tcp': {} },
      HostConfig: {
        PortBindings: {
          '6080/tcp': [{ HostPort: '0' }]  // 0 = Docker picks a free port
        },
        AutoRemove: true,   // auto-delete container when stopped
        Memory: 512 * 1024 * 1024,  // 512MB RAM limit per session
      }
    })

    await container.start()

    // Wait a moment for noVNC to boot inside container
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Find which port Docker assigned
    const info = await container.inspect()
    const port = info.NetworkSettings.Ports['6080/tcp'][0].HostPort

    // Save session info
    sessions[sessionId] = {
      containerId: container.id,
      port: port,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000  // 30 min TTL
    }

    console.log(`✅ Session ${sessionId} started on port ${port}`)

    res.json({
      sessionId,
      sessionUrl: `http://localhost:${port}/vnc.html`,
      expiresIn: '30 minutes'
    })

  } catch (err) {
    console.error('❌ Error creating session:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── GET SESSION INFO ─────────────────────────────────────
app.get('/api/session/:id', (req, res) => {
  const session = sessions[req.params.id]
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  res.json(session)
})

// ─── STOP SESSION ─────────────────────────────────────────
app.delete('/api/session/:id', async (req, res) => {
  const session = sessions[req.params.id]
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  try {
    const container = docker.getContainer(session.containerId)
    await container.stop()
    delete sessions[req.params.id]
    console.log(`🛑 Session ${req.params.id} stopped`)
    res.json({ message: 'Session stopped' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── LIST ALL SESSIONS ────────────────────────────────────
app.get('/api/sessions', (req, res) => {
  res.json(sessions)
})

// ─── START SERVER ─────────────────────────────────────────
app.listen(4000, () => {
  console.log('🚀 Backend running at http://localhost:4000')
})
