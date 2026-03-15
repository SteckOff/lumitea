import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminPanel } from './pages/AdminPanel'
import './index.css'

// Simple Home component (you can expand this)
function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <h1 className="text-5xl font-serif font-bold text-teal-700 mb-4">
        Lumi Tea
      </h1>
      <p className="text-xl text-stone-600 mb-8">
        Premium Korean Tea from Incheon
      </p>
      <div className="flex gap-4">
        <a 
          href="/admin" 
          className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Admin Panel
        </a>
      </div>
    </div>
  )
}

// Protected route for admin
function ProtectedAdmin() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />
  }
  
  return <AdminPanel />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
