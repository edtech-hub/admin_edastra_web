"use client"

import Sidebar from './Sidebar'
import ProtectedRoute from './ProtectedRoute'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#111111]">
        <Sidebar />
        {/* Main content — offset by sidebar width */}
        <main className="ml-[240px] transition-all duration-300">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
