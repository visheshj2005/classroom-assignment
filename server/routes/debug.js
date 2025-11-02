import express from 'express'

const router = express.Router()

// Temporary debug endpoint to check session status
router.get('/session', (req, res) => {
  console.log('🔍 Debug Session Endpoint Called')
  console.log('- Session exists:', !!req.session)
  console.log('- Session ID:', req.session?.id)
  console.log('- Session data:', req.session)
  console.log('- Cookies received:', req.headers.cookie)
  
  res.json({
    success: true,
    data: {
      hasSession: !!req.session,
      sessionId: req.session?.id,
      userId: req.session?.userId,
      userRole: req.session?.userRole,
      cookiesReceived: !!req.headers.cookie,
      sessionData: req.session
    }
  })
})

export default router