import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './lib/blink'
import { Toaster } from 'sonner'

// Components
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'

// Pages
import { Dashboard } from './pages/Dashboard'
import { Onboarding } from './pages/Onboarding'
import { StrategyBuilder } from './pages/StrategyBuilder'
import { ContentGenerator } from './pages/ContentGenerator'
import { LaunchChecklist } from './pages/LaunchChecklist'
import { Analytics } from './pages/Analytics'
import { Integrations } from './pages/Integrations'
import { ReplitIntegration } from './pages/ReplitIntegration'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Check if user needs onboarding by checking localStorage
      if (state.user) {
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${state.user.id}`)
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true)
        }
      }
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Launchbase...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to Launchbase</h1>
          <p className="text-muted-foreground mb-8">
            The AI-powered platform that takes your MVP from idea to go-to-market and beyond.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header user={user} />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/strategy" element={<StrategyBuilder />} />
                <Route path="/content" element={<ContentGenerator />} />
                <Route path="/checklist" element={<LaunchChecklist />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/integrations/replit" element={<ReplitIntegration />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
      </div>
    </Router>
  )
}

export default App