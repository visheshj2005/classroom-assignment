import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { auth } from '../middleware/auth.js'
import { SUBSCRIPTION_LIMITS, upgradeUserSubscription, getUserSubscriptionInfo } from '../services/subscriptionService.js'

const router = express.Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_RZz1OkKBxRJyef",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "9ftoGWBfWlz5g3i8UaHhjE5F"
})

// Get subscription plans
router.get('/plans', auth, async (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_LIMITS).map(([key, value]) => ({
      id: key,
      ...value
    }))

    res.json({
      success: true,
      data: { plans }
    })
  } catch (error) {
    console.error('Error fetching plans:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    })
  }
})

// Get user subscription info
router.get('/subscription', auth, async (req, res) => {
  try {
    const subscriptionInfo = await getUserSubscriptionInfo(req.user.id)
    
    res.json({
      success: true,
      data: subscriptionInfo
    })
  } catch (error) {
    console.error('Error fetching subscription info:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription information'
    })
  }
})

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { tier } = req.body

    if (!tier || !SUBSCRIPTION_LIMITS[tier]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription tier'
      })
    }

    const tierInfo = SUBSCRIPTION_LIMITS[tier]
    
    if (tierInfo.price === 0) {
      return res.status(400).json({
        success: false,
        message: 'Free tier does not require payment'
      })
    }

    const options = {
      amount: tierInfo.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `sub_${req.user.id.slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        userId: req.user.id,
        tier: tier,
        userEmail: req.user.email
      }
    }

    const order = await razorpay.orders.create(options)
    
    res.json({
      success: true,
      data: {
        order,
        tierInfo
      }
    })
  } catch (error) {
    console.error('Error creating payment order:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    })
  }
})

// Verify payment and upgrade subscription
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "9ftoGWBfWlz5g3i8UaHhjE5F")
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      })
    }

    // Upgrade user subscription
    const updatedUser = await upgradeUserSubscription(req.user.id, tier, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    })

    res.json({
      success: true,
      message: 'Payment verified and subscription upgraded successfully',
      data: {
        subscription: updatedUser.subscription
      }
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    })
  }
})

export default router