import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from './components/Sidebar.jsx'
import { TopBar } from './components/TopBar.jsx'
import { Icon } from './components/icons.jsx'
import { SearchModal, CommandModal, useKeyboard } from './components/CommandPalette.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Models from './pages/Models.jsx'
import TextStudio from './pages/TextStudio.jsx'
import ImageStudio from './pages/ImageStudio.jsx'
import CodeStudio from './pages/CodeStudio.jsx'
import DataVault from './pages/DataVault.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const [drawer, setDrawer] = useState(false)
  const { searchOpen, setSearchOpen, cmdOpen, setCmdOpen } = useKeyboard()

  useEffect(() => {
    function handler() { setSearchOpen(true) }
    window.addEventListener('opensearch', handler)
    return () => window.removeEventListener('opensearch', handler)
  }, [setSearchOpen])

  return (
    <div className="grain flex h-screen w-screen overflow-hidden bg-vault text-cream-50">
      {/* desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
            >
              <div className="relative h-full">
                <Sidebar onNavigate={() => setDrawer(false)} />
                <button
                  onClick={() => setDrawer(false)}
                  className="btn-ghost absolute -right-11 top-3 p-2"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setDrawer(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/models" element={<Models />} />
            <Route path="/text" element={<TextStudio />} />
            <Route path="/image" element={<ImageStudio />} />
            <Route path="/code" element={<CodeStudio />} />
            <Route path="/data" element={<DataVault />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CommandModal open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}
