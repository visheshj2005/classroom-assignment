import User from '../models/User.js'
import Class from '../models/Class.js'

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxClasses: 1,
    name: 'Free',
    price: 0,
    features: ['1 Class', 'Basic Support']
  },
  lite: {
    maxClasses: 4,
    name: 'Lite',
    price: 1, // in INR
    features: ['4 Classes', 'Email Support', 'Basic Analytics']
  },
  premium: {
    maxClasses: -1, // unlimited
    name: 'Premium',
    price: 10, // in INR
    features: ['Unlimited Classes', 'Priority Support', 'Advanced Analytics']
  }
}

export const checkClassCreationLimit = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const userTier = user.subscription?.tier || 'free'
    const limit = SUBSCRIPTION_LIMITS[userTier].maxClasses

    // If unlimited (premium)
    if (limit === -1) {
      return { canCreate: true, currentCount: 0, limit: -1 }
    }

    // Count current classes
    const currentClassCount = await Class.countDocuments({ 
      teacherId: userId, 
      isActive: true 
    })

    const canCreate = currentClassCount < limit

    return {
      canCreate,
      currentCount: currentClassCount,
      limit,
      tier: userTier
    }
  } catch (error) {
    console.error('Error checking class creation limit:', error)
    throw error
  }
}

export const upgradeUserSubscription = async (userId, newTier, paymentDetails) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Calculate end date (1 year from now)
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)

    const updateData = {
      'subscription.tier': newTier,
      'subscription.status': 'active',
      'subscription.startDate': new Date(),
      'subscription.endDate': endDate
    }

    if (paymentDetails) {
      updateData['subscription.paymentId'] = paymentDetails.paymentId
      updateData['subscription.orderId'] = paymentDetails.orderId
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    )

    return updatedUser
  } catch (error) {
    console.error('Error upgrading user subscription:', error)
    throw error
  }
}

export const getUserSubscriptionInfo = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const tier = user.subscription?.tier || 'free'
    const classCount = await Class.countDocuments({ 
      teacherId: userId, 
      isActive: true 
    })

    return {
      currentTier: tier,
      tierInfo: SUBSCRIPTION_LIMITS[tier],
      classCount,
      subscription: user.subscription
    }
  } catch (error) {
    console.error('Error getting user subscription info:', error)
    throw error
  }
}