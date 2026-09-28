import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DashboardShell } from './components/layout/DashboardShell'
import type { PageKey } from './components/layout/Sidebar'
import { Home } from './pages/Home'
import { SellerCopilot } from './pages/SellerCopilot'
import { CeoAI } from './pages/CeoAI'
import { Products } from './pages/Products'

function App() {
  const [page, setPage] = useState<PageKey>('home')

  return (
    <DashboardShell active={page} onNavigate={setPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {page === 'home' && <Home />}
          {page === 'seller' && <SellerCopilot />}
          {page === 'ceo' && <CeoAI />}
          {page === 'products' && <Products />}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  )
}

export default App
