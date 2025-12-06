import { useState, useEffect } from 'react'

function PortalPage() {
  const [activeTab, setActiveTab] = useState('history')
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user info on mount
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('/superchat/api/user/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        const data = await response.json()

        if (data.success && data.is_logged_in) {
          setUserInfo(data.user)
        } else {
          setUserInfo(null)
        }
      } catch (error) {
        console.error('[PortalPage] Failed to fetch user info:', error)
        setUserInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const chatHistory = [
    {
      id: 1,
      date: '2024-11-24',
      title: 'Product Analysis',
      preview: 'Created table showing top 10 products...',
    },
    {
      id: 2,
      date: '2024-11-23',
      title: 'Revenue Chart',
      preview: 'Generated monthly revenue visualization...',
    },
    {
      id: 3,
      date: '2024-11-22',
      title: 'Customer Form',
      preview: 'Built registration form with validation...',
    },
  ]

  const savedComponents = [
    {
      id: 1,
      type: 'table',
      name: 'Top Products',
      createdAt: '2024-11-24',
    },
    {
      id: 2,
      type: 'chart',
      name: 'Monthly Revenue',
      createdAt: '2024-11-23',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-4">My Portal</h1>
        <p className="text-lg text-gray-600">
          Manage your chat history, saved components, and account settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 max-w-4xl mx-auto">
          {['history', 'saved', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Chat History</h2>
              <button className="btn-secondary">Export All</button>
            </div>
            <div className="space-y-3">
              {chatHistory.map((chat) => (
                <div key={chat.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{chat.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{chat.preview}</p>
                      <p className="text-gray-400 text-xs">{chat.date}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700">
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Saved Components</h2>
              <button className="btn-secondary">New Component</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedComponents.map((component) => (
                <div key={component.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-primary-600 mb-1">
                        {component.type.toUpperCase()}
                      </div>
                      <h3 className="font-semibold">{component.name}</h3>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Created: {component.createdAt}</p>
                  <div className="flex space-x-2">
                    <button className="btn-primary text-sm flex-1">Open</button>
                    <button className="btn-secondary text-sm flex-1">Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Account Settings</h2>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              {loading ? (
                <div className="text-center text-gray-500">Loading profile...</div>
              ) : userInfo ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input type="text" className="input-field" defaultValue={userInfo.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input type="email" className="input-field" defaultValue={userInfo.email} />
                  </div>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="mb-4">Please sign in to view your profile.</p>
                  <a href="/web/login" className="btn-primary">
                    Sign In
                  </a>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Enable email notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Auto-save chat history</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable experimental features</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PortalPage
