import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isFamilyReady, loadData } from './utils/storage'
import Landing      from './pages/Landing'
import CreateFamily from './pages/CreateFamily'
import Children     from './pages/Children'
import Chores       from './pages/Chores'
import Rewards      from './pages/Rewards'
import Dashboard    from './pages/Dashboard'
import Wheel        from './pages/Wheel'
import Settings     from './pages/Settings'
import { Analytics } from '@vercel/analytics/react';

/** Redirect to /create-family if localStorage hasn't been initialised yet */
function Ready({ children }: { children: React.ReactNode }) {
  if (!isFamilyReady()) return <Navigate to="/create-family" replace />
  return <>{children}</>
}

/** Root "/": show Landing if no children, else redirect to dashboard (children list) */
function RootRoute() {
  const { children } = loadData()
  if (children.length > 0) return <Navigate to="/children" replace />
  return <Landing />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"              element={<RootRoute />} />
        <Route path="/create-family" element={<CreateFamily />} />

        {/* Requires family setup */}
        <Route path="/children"           element={<Ready><Children /></Ready>} />
        <Route path="/chores/:childId"     element={<Ready><Chores /></Ready>} />
        <Route path="/chores"             element={<Ready><Chores /></Ready>} />
        <Route path="/rewards/:childId"   element={<Ready><Rewards /></Ready>} />
        <Route path="/rewards"            element={<Ready><Rewards /></Ready>} />
        <Route path="/dashboard/:childId" element={<Ready><Dashboard /></Ready>} />
        <Route path="/wheel/:childId"     element={<Ready><Wheel /></Ready>} />
        <Route path="/settings"           element={<Ready><Settings /></Ready>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Vercel Analytics */}
      <Analytics />
    </BrowserRouter>
  )
}
