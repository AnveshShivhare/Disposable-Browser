// Store tab → session mapping
const tabSessions = {}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SESSION_CREATED') {
    // Remember which tab owns which session
    tabSessions[message.tabId] = message.sessionId
    console.log(`Tracking session ${message.sessionId} on tab ${message.tabId}`)
  }
})

// When ANY tab is closed, check if it was a session tab
chrome.tabs.onRemoved.addListener((tabId) => {
  const sessionId = tabSessions[tabId]

  if (sessionId) {
    console.log(`Tab closed — stopping session ${sessionId}`)

    // Call backend to stop the container
    fetch(`http://localhost:4000/api/session/${sessionId}`, {
      method: 'DELETE'
    })
    .then(() => console.log(`Session ${sessionId} stopped`))
    .catch(err => console.error('Failed to stop session:', err))

    // Remove from tracking
    delete tabSessions[tabId]
  }
})
