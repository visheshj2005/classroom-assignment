import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { Crown, Check, CreditCard, Calendar, Users, BookOpen } from 'lucide-react'

const Subscription = () => {
  const { user, api } = useAuth()
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [upgradingPlan, setUpgradingPlan] = useState(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Fetch subscription info and plans
      const [subscriptionResponse, plansResponse] = await Promise.all([
        api.get('/payments/subscription'),
        api.get('/payments/plans')
      ])

      setSubscriptionInfo(subscriptionResponse.data.data)
      setPlans(plansResponse.data.data.plans)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return

    try {
      setUpgradingPlan(planId)

      // Create payment order
      const orderResponse = await api.post('/payments/create-order', { tier: planId })
      const { order, tierInfo } = orderResponse.data.data

      // Initialize Razorpay
      const options = {
        key: "rzp_live_RZz1OkKBxRJyef", // This should come from environment
        amount: order.amount,
        currency: order.currency,
        name: "Classroom Assignment Portal",
        description: `Upgrade to ${tierInfo.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/verify-payment', {
              ...response,
              tier: planId
            })

            if (verifyResponse.data.success) {
              alert('Subscription upgraded successfully!')
              fetchSubscriptionData() // Refresh data
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed')
            setUpgradingPlan(null)
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: "#4f46e5"
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error)
        alert('Payment failed. Please try again.')
        setUpgradingPlan(null)
      })
      rzp.open()

    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Failed to initiate payment. Please try again.')
      setUpgradingPlan(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentTier = subscriptionInfo?.currentTier || 'free'
  const currentPlan = plans.find(plan => plan.id === currentTier)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and upgrade your plan</p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {currentTier === 'premium' && <Crown className="h-6 w-6 text-purple-600 mr-2" />}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentTier === 'free' ? 'bg-gray-100 text-gray-800' :
                  currentTier === 'lite' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {currentPlan?.name} Plan
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{currentPlan?.price || 0}
                {currentTier !== 'free' && <span className="text-sm text-gray-500">/year</span>}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Classes Used</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptionInfo?.classCount || 0}
                <span className="text-sm text-gray-500">
                  /{currentPlan?.maxClasses === -1 ? '∞' : currentPlan?.maxClasses}
                </span>
              </p>
            </div>

            {subscriptionInfo?.subscription?.endDate && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Expires On</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(subscriptionInfo.subscription.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === currentTier
              const isUpgrade = plan.price > (currentPlan?.price || 0)
              
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-lg p-6 relative ${
                    plan.id === 'premium' ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {plan.id === 'premium' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      {plan.id === 'premium' && <Crown className="h-6 w-6 text-purple-600 mr-2" />}
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{plan.price}
                      {plan.price > 0 && <span className="text-sm text-gray-500">/year</span>}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700">
                        {plan.maxClasses === -1 ? 'Unlimited' : plan.maxClasses} Classes
                      </span>
                    </div>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || upgradingPlan === plan.id || plan.id === 'free'}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.id === 'free'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : upgradingPlan === plan.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isUpgrade
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : plan.id === 'free'
                      ? 'Free Plan'
                      : upgradingPlan === plan.id
                      ? 'Processing...'
                      : isUpgrade
                      ? 'Upgrade Now'
                      : 'Downgrade'
                    }
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment History */}
        {subscriptionInfo?.subscription?.paymentId && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {currentPlan?.name} Plan Subscription
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment ID: {subscriptionInfo.subscription.paymentId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{currentPlan?.price}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(subscriptionInfo.subscription.startDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}

export default Subscription