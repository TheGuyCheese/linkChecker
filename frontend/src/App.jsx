import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CheckProvider } from './context/CheckContext.jsx'
import NavBar from './components/NavBar.jsx'
import InputPage from './pages/InputPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <CheckProvider>
        <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
          <NavBar />
          <Routes>
            <Route path="/"        element={<InputPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
          <Footer />
        </div>
      </CheckProvider>
    </BrowserRouter>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant w-full mt-auto">
      <div className="w-full py-md px-lg flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-md md:gap-0">
        <span className="font-label-sm text-label-sm text-secondary">
          2025 LinkChecker - Checks HTTP and HTTPS automatically
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Built with React + Node.js
        </span>
      </div>
    </footer>
  )
}
