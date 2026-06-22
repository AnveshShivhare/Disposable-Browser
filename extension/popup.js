const newSessionBtn = document.getElementById('newSessionBtn')
const status = document.getElementById('status')
const sessionInfo = document.getElementById('sessionInfo')
const shareUrl = document.getElementById('shareUrl')
const copyBtn = document.getElementById('copyBtn')

newSessionBtn.addEventListener('click', async () => {
  // Disable button while loading
  newSessionBtn.disabled = true
  status.textContent = '⏳ Spinning up your browser...'
  sessionInfo.style.display = 'none'

  try {
    // Call your backend API
    const response = await fetch('http://localhost:4000/api/session/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (data.sessionUrl) {
      // Open the session in a new tab
      chrome.tabs.create({ url: data.sessionUrl })

      // Show share info in popup
      status.textContent = '✅ Session started!'
      shareUrl.textContent = data.sessionUrl
      sessionInfo.style.display = 'block'
    } else {
      status.textContent = '❌ Failed to create session'
    }

  } catch (err) {
    status.textContent = '❌ Backend not running. Start it first!'
    console.error(err)
  }

  newSessionBtn.disabled = false
})

// Copy share link to clipboard
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shareUrl.textContent)
  copyBtn.textContent = '✅ Copied!'
  setTimeout(() => { copyBtn.textContent = '📋 Copy Share Link' }, 2000)
})
