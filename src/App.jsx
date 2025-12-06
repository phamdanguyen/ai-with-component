import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import InsuranceLandingPage from './pages/InsuranceLandingPage'
import DemoPage from './pages/DemoPage'
import PlaygroundPage from './pages/PlaygroundPage'
import ExpandPage from './pages/ExpandPage'
import KnowledgePage from './pages/KnowledgePage'
import HelpPage from './pages/HelpPage'
import PortalPage from './pages/PortalPage'

/**
 * Super Chat App - Route Configuration
 *
 * v10.6.0: Consolidated routing - /expand is the canonical B2C chat URL
 *
 * Route Map:
 * - /superchat/          -> LandingPage (marketing)
 * - /superchat/expand    -> ExpandPage (B2C Customer Chat - PRIMARY)
 * - /superchat/chat      -> Redirect to /expand (canonical URL)
 * - /superchat/demo      -> DemoPage (GenUI components showcase)
 * - /superchat/playground-> PlaygroundPage (dev testing only)
 * - /superchat/knowledge -> KnowledgePage
 * - /superchat/help      -> HelpPage
 * - /superchat/portal    -> PortalPage (B2B)
 */
function App() {
  return (
    <BrowserRouter basename="/superchat">
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Landing/Marketing */}
          <Route index element={<LandingPage />} />

          {/* B2C Customer Chat - PRIMARY ENTRY POINT */}
          <Route path="expand" element={<ExpandPage />} />

          {/* Redirect /chat to /expand (canonical B2C URL) */}
          <Route path="chat" element={<Navigate to="/expand" replace />} />

          {/* Demo & Dev Tools */}
          <Route path="demo" element={<DemoPage />} />
          <Route path="playground" element={<PlaygroundPage />} />

          {/* Support Pages */}
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="help" element={<HelpPage />} />

          {/* B2B Portal */}
          <Route path="portal" element={<PortalPage />} />

          {/* Insurance Marketplace Landing */}
          <Route path="insurance" element={<InsuranceLandingPage />} />

          {/* Catch-all redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
