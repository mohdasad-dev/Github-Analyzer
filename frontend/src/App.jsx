import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Profiles from './pages/Profiles.jsx'
import ProfileDetail from './pages/ProfileDetail.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/profiles/:username" element={<ProfileDetail />} />
      </Routes>
    </div>
  )
}
